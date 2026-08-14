import type { TranslationOption, TranslationResponse } from "../types";
import { translateMessage } from "../lib/translate.functions";

export class TranslationError extends Error {
    kind: "network" | "auth" | "parse" | "api";
    constructor(kind: TranslationError["kind"], message: string) {
          super(message);
          this.kind = kind;
    }
}

type RawOption = {
    translation?: string | undefined;
    romanization?: string | undefined;
    literal?: string | undefined;
    style_label?: string | undefined;
};
type RawResponse = Partial<TranslationResponse> & {
    /** Older single-result shape, still accepted for resilience. */
    translation?: string;
    romanization?: string;
    literal?: string;
    options?: RawOption[];
};


function normalizeOption(raw: RawOption): TranslationOption | null {
    if (!raw?.translation) return null;
    return {
          translation: raw.translation,
          romanization: raw.romanization ?? "",
          literal: raw.literal ?? "",
          style_label: raw.style_label ?? "",
    };
}

function extractJson(raw: string): TranslationResponse {
    let text = raw.trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence?.[1]) text = fence[1].trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
          throw new TranslationError("parse", "Unexpected response. Please try again.");
    }
    try {
          const parsed = JSON.parse(text.slice(start, end + 1)) as RawResponse;
          const options = (
                  Array.isArray(parsed.options) && parsed.options.length > 0
                    ? parsed.options
                    : [
                      {
                                      translation: parsed.translation,
                                      romanization: parsed.romanization,
                                      literal: parsed.literal,
                                      style_label: "",
                      },
                                ]
                )
            .map(normalizeOption)
            .filter((option): option is TranslationOption => option !== null);

      if (options.length === 0) throw new Error("missing translation");

      return {
              options,
              breakdown: Array.isArray(parsed.breakdown) ? parsed.breakdown : [],
              vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
              tone_note: parsed.tone_note ?? "",
      };
    } catch {
          throw new TranslationError("parse", "Unexpected response. Please try again.");
    }
}


export type HistoryMessage = { role: "user" | "assistant"; content: string };

async function callAnthropic(
    apiKey: string,
    systemPrompt: string,
    history: HistoryMessage[],
    userMessage: string,
  ): Promise<string> {
    let response: Response;
    try {
          response = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                            "content-type": "application/json",
                            "x-api-key": apiKey,
                            "anthropic-version": "2023-06-01",
                            "anthropic-dangerous-direct-browser-access": "true",
                  },
                  body: JSON.stringify({
                            model: "claude-sonnet-4-5",
                            max_tokens: 1500,
                            system: systemPrompt,
                            messages: [...history, { role: "user", content: userMessage }],
                  }),
          });
    } catch {
          throw new TranslationError("network", "No connection. Check your internet and try again.");
    }

  if (!response.ok) {
        throw new TranslationError(
                "auth",
                "Translation failed. Check your API key in Settings.",
              );
  }

  const payload = (await response.json()) as { content?: { type: string; text?: string }[] };
    return (payload.content ?? [])
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("");
}

export async function requestTranslation(args: {
    backend: "builtin" | "own";
    apiKey: string;
    systemPrompt: string;
    history: HistoryMessage[];
    userMessage: string;
}): Promise<TranslationResponse> {
    if (args.backend === "own") {
          if (!args.apiKey.trim()) {
                  throw new TranslationError("auth", "Add your API key in Settings to translate.");
          }
          const raw = await callAnthropic(
                  args.apiKey.trim(),
                  args.systemPrompt,
                  args.history,
                  args.userMessage,
                );
          return extractJson(raw);
    }

  let result: Awaited<ReturnType<typeof translateMessage>>;
    try {
          result = await translateMessage({
                  data: {
                            systemPrompt: args.systemPrompt,
                            history: args.history,
                            userMessage: args.userMessage,
                  },
          });
    } catch {
          throw new TranslationError("network", "No connection. Check your internet and try again.");
    }

  if (!result.ok) throw new TranslationError("api", result.error);
    return extractJson(result.text);
}

export async function testAnthropicKey(apiKey: string): Promise<boolean> {
    try {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                            "content-type": "application/json",
                            "x-api-key": apiKey,
                            "anthropic-version": "2023-06-01",
                            "anthropic-dangerous-direct-browser-access": "true",
                  },
                  body: JSON.stringify({
                            model: "claude-sonnet-4-5",
                            max_tokens: 8,
                            messages: [{ role: "user", content: "hi" }],
                  }),
          });
          return response.ok;
    } catch {
          return false;
    }
}
