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

export const translateMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
        const key = process.env["GEMINI_API_KEY"];
        if (!key) {
                return { ok: false as const, error: "AI is not configured on this project." };
        }

               const { createGeminiProvider } = await import("./ai-gateway.server");
        const gateway = createGeminiProvider(key);

               try {
                       const result = streamText({
                                 model: gateway("gemini-3.5-flash-lite"),
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
                       if (message.includes("402") || message.includes("403")) {
                                 return { ok: false as const, error: "Gemini API key is invalid or out of quota." };
                       }
                       return { ok: false as const, error: message };
               }
  });
