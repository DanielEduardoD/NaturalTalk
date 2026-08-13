import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

const ChatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const TranslateInput = z.object({
  systemPrompt: z.string().min(1),
  history: z.array(ChatMessage).default([]),
  userMessage: z.string().min(1),
});

export const translateWithHostedAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      return { ok: false as const, error: "The translation engine is not configured on this project." };
    }

    const { createHostedGatewayProvider } = await import("./gateway.server");
    const gateway = createHostedGatewayProvider(key);

    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system: data.systemPrompt,
        messages: [...data.history, { role: "user" as const, content: data.userMessage }],
      });
      const text = await result.text;
      return { ok: true as const, text };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Translation failed.";
      if (message.includes("429")) {
        return { ok: false as const, error: "Rate limited. Please try again in a moment." };
      }
      if (message.includes("402")) {
        return { ok: false as const, error: "Translation quota exhausted. Please try again later." };
      }
      return { ok: false as const, error: message };
    }
  });
