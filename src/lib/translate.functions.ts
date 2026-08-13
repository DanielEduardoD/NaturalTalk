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

export const translateWithLovableAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      return { ok: false as const, error: "AI is not configured on this project." };
    }

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

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
        return { ok: false as const, error: "AI credits exhausted. Add credits to continue." };
      }
      return { ok: false as const, error: message };
    }
  });
