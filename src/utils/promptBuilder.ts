import type {
  Message,
  MessageMood,
  RecipientProfile,
  SpeakerProfile,
  ToneSettings,
} from '../types';
import { LANGUAGE_CONFIGS } from '../config/languageConfig';

export const MOOD_LABELS: Record<MessageMood, string> = {
  default: 'Match the conversation style',
  funny: 'Funny — light, joking, a bit witty',
  dramatic: 'Dramatic — exaggerated, theatrical, for fun',
  affectionate: 'Affectionate — warm and caring',
  excited: 'Excited — energetic and enthusiastic',
  apologetic: 'Apologetic — sorry, softening, careful',
  serious: 'Serious — sober and direct, no jokes',
  assertive: 'Assertive — firm, confident, sets a boundary',
  grateful: 'Grateful — appreciative and thankful',
  custom: 'Custom',
};

function ageStyleDescription(tone: ToneSettings, speakerAge: number | null): string {
  if (tone.ageStyle === 'custom' && tone.customAge) return `about ${tone.customAge} years old`;
  if (tone.ageStyle === 'none') {
    return speakerAge ? `about ${speakerAge} years old` : 'age-neutral, no strong generational markers';
  }
  return `in the ${tone.ageStyle} age range`;
}

export function buildSystemPrompt(
  speaker: SpeakerProfile,
  recipient: RecipientProfile,
  tone: ToneSettings,
  optionCount: 1 | 3 = 1,
): string {
  const langConfig = LANGUAGE_CONFIGS[recipient.targetLanguage];
  const languageSpecificRules = langConfig?.languageSpecificPromptRules ||
    `This language has general AI coverage. Apply your best knowledge of natural speech patterns,
    appropriate social register, and age-appropriate language for the configured relationship type.`;

  const sourceLangConfig = LANGUAGE_CONFIGS[recipient.sourceLanguage];
  const sourceLanguageName = sourceLangConfig?.name || recipient.sourceLanguage;
  const targetLanguageName = langConfig?.name || recipient.targetLanguage;
  const dialectNote = recipient.dialect ? ` (${recipient.dialect})` : '';
  const count = optionCount === 3 ? 3 : 1;
      const wantsRubyReading = recipient.targetLanguage === 'ja' || recipient.targetLanguage === 'zh';
      const rubySection = wantsRubyReading
        ? [
                    '=== READING AID ===',
                    'The target language uses characters whose pronunciation is not obvious from the script alone. For the FIRST option only, also return a "ruby" array breaking the "translation" text into ordered segments so the app can show an inline reading aid above the characters that need one (furigana for Japanese kanji, pinyin for Mandarin hanzi).',
                    '- Each segment has "base" (a run of the translation text) and "reading" (its pronunciation, or an empty string if that segment does not need one).',
                    '- Concatenating the base field of every segment, in order, must reproduce the "translation" string EXACTLY, character for character - this is required, not optional.',
                    '- Only kanji/hanzi runs get a non-empty "reading". Hiragana, katakana, punctuation, spaces, and Latin characters get an empty "reading".',
                    recipient.targetLanguage === 'ja'
                      ? 'Readings are the hiragana pronunciation actually used in this sentence (the real inflected reading, not the dictionary reading).'
                      : 'Readings are Hanyu Pinyin with tone marks.',
                    '',
                  ].join('\n')
              : '';

  return `You are NaturalTalk, a natural language translation assistant. Your job is NOT to translate literally word-for-word, but to REWRITE the message in the target language the way a real native speaker would actually text it — even if the words used are completely different from the source, as long as the core meaning, intent, and emotional tone are preserved.

=== SPEAKER PROFILE ===
Name: ${speaker.name || 'unspecified'}
Age: ${speaker.age ?? 'unspecified'} — write as if the speaker sounds ${ageStyleDescription(tone, speaker.age)}
Gender: ${speaker.gender && speaker.gender !== 'prefer-not-to-say' ? speaker.gender : 'unspecified — avoid assuming grammatical gender for the speaker; prefer gender-neutral phrasing where the language allows it'}
Source language (what they write in): ${sourceLanguageName}

=== RECIPIENT PROFILE ===
Name: ${recipient.name}
Age: ${recipient.age || 'unspecified'}
Gender: ${recipient.gender && recipient.gender !== 'prefer-not-to-say' ? recipient.gender : 'unspecified — avoid assuming grammatical gender for the recipient'}
Relationship to speaker: ${recipient.relationship === 'custom' && recipient.customRelationship ? recipient.customRelationship : recipient.relationship}
${recipient.pronounSelf ? `Pronoun for speaker to use: ${recipient.pronounSelf}` : ''}
${recipient.pronounRecipient ? `Pronoun for recipient: ${recipient.pronounRecipient}` : ''}
${recipient.dialect ? `Dialect/variant: ${recipient.dialect}` : ''}
${recipient.region ? `City / micro-region: ${recipient.region}. Match the local way of speaking in this specific place — vocabulary, fillers, intonation markers and slang differ from neighbouring cities in the same dialect area. Never substitute a generic national variety when a local one exists.` : ''}
${recipient.formalityLevel ? `Formality level: ${recipient.formalityLevel}` : ''}
${recipient.speechLevel ? `Speech level: ${recipient.speechLevel}` : ''}
Custom notes: ${recipient.customNotes || 'none'}

=== TARGET LANGUAGE ===
${targetLanguageName}${dialectNote}

=== TONE SETTINGS ===
Overall tone: ${tone.tone === 'custom' && tone.customTone ? tone.customTone : tone.tone}
Sound like: ${ageStyleDescription(tone, speaker.age)}
Slang level: ${tone.slangLevel}
Internet language / shortcuts: ${tone.internetLanguage ? 'ON — use shortcuts, abbreviations, and casual texting patterns common among native speakers of ' + targetLanguageName + ' in that age range. Use NATIVE equivalents, not English shortcuts.' : 'OFF'}

=== LANGUAGE-SPECIFIC RULES ===
${languageSpecificRules}

=== UNIVERSAL RULES (always apply regardless of language) ===
1. NEVER produce word-for-word literal translation in the "translation" field. It must sound like a real person texted it natively.
2. Apply all appropriate social register, pronoun, formality, and honorific rules for the target language based on the relationship type and the recipient's age relative to the speaker.
3. Tone "gen-alpha": current teen-era internet speech of native ${targetLanguageName} speakers (very online, meme-adjacent, short). Tone "gen-z": young adult casual internet speech. Tone "professional": workplace-appropriate, clear and courteous. Tone "formal": full formal register.
4. Use the recipient's name (${recipient.name}) only where it would feel natural in the target language and culture.
5. Adapt cultural references thoughtfully — keep them if they translate well, find an equivalent if they don't.
6. This app is used for every kind of relationship — work, family, friendship, service, study and dating. Never add romantic or flirtatious colouring unless the tone or relationship calls for it.
7. The "literal" field must be a plain, close, word-for-word style rendering back into ${sourceLanguageName} so the speaker understands exactly what they are about to send. It is a safety check, not a polished translation.
${rubySection}

=== OUTPUT FORMAT ===
Respond ONLY with valid JSON. No markdown fences, no preamble, no explanation outside the JSON:
{
  "options": [
    {
      "translation": "the rewritten message in the target language script",
      "romanization": "pronunciation guide if the target language uses a non-Latin script (romaji, pinyin, Korean romanization, Arabic transliteration...). Empty string if not applicable",
      "literal": "close literal back-translation of THIS option into ${sourceLanguageName}",
      "style_label": "2-3 word label describing how this version differs, e.g. 'Warm and short', 'Direct', 'Playful'"${wantsRubyReading ? ',\n      "ruby": [ { "base": "a run of characters from translation, in order", "reading": "pronunciation for that run, empty string if not needed" } ]' : ''}
    }
  ],
  "breakdown": [
    { "phrase": "phrase in target script", "romanization": "reading if applicable, otherwise empty string", "meaning": "meaning in ${sourceLanguageName}" }
  ],
  "vocabulary": [
    { "word": "word in target script", "romanization": "reading if applicable", "meaning": "definition in ${sourceLanguageName}", "importance": "high or medium" }
  ],
  "tone_note": "brief note on any significant tone, pronoun, dialect, region or register decision made. Empty string if unremarkable."
}

Return EXACTLY ${count} item${count === 1 ? '' : 's'} in "options".${count === 3 ? ' The three options must be meaningfully different from each other in phrasing, length or warmth — not cosmetic variations. All three must still respect the configured tone, register and relationship.' : ''}
Breakdown and vocabulary describe the FIRST option.${wantsRubyReading ? ' The FIRST option also includes the "ruby" array described above; the other options omit it.' : ''}
Vocabulary: flag only genuinely useful words — slang, key pronouns, culturally specific terms, useful texting shortcuts. Return an empty array if nothing is worth flagging.
Meanings in breakdown and vocabulary must always be in ${sourceLanguageName}.`;
}

export function buildUserMessage(
  userInput: string,
  receivedMessage: string | null,
  inlineContext: string | null,
  sourceLanguageName: string,
  mood?: { mood: MessageMood; detail?: string } | null,
): string {
  let message = `[Source language: ${sourceLanguageName}]\n`;

  if (receivedMessage) {
    message += `They sent me: "${receivedMessage}"\nI want to reply with: "${userInput}"`;
  } else {
    message += `Translate this message I want to send: "${userInput}"`;
  }

  if (inlineContext) {
    message += `\n\nContext for this message only (does not change persistent settings): ${inlineContext}`;
  }

  if (mood && mood.mood !== 'default') {
    const description = mood.mood === 'custom' ? mood.detail || '' : MOOD_LABELS[mood.mood];
    if (description) {
      message += `\n\nMood for THIS message only: ${description}. Keep the conversation's base register and relationship rules, but colour this single message with that mood.`;
    }
  }

  return message;
}

export function buildHistoryMessages(messages: Message[]): { role: 'user' | 'assistant'; content: string }[] {
  // Send last 6 outgoing messages as conversation context
  const recentOutgoing = messages
    .filter(m => m.type === 'outgoing')
    .slice(-6);

  return recentOutgoing.flatMap(msg => [
    { role: 'user' as const, content: msg.sourceText },
    { role: 'assistant' as const, content: JSON.stringify({
        options: [
          {
            translation: msg.translation,
            romanization: msg.romanization || '',
            literal: msg.literal || '',
            style_label: '',
          },
        ],
        breakdown: msg.breakdown || [],
        vocabulary: msg.vocabularyFlagged || [],
        tone_note: msg.toneNote || '',
      })
    },
  ]);
}
