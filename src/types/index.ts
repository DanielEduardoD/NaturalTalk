export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export type ToneType =
  | 'gen-alpha' | 'gen-z' | 'casual' | 'friendly'
  | 'flirty' | 'neutral' | 'professional' | 'formal'
  | 'custom';

export type AgeStyle =
  | '13-17' | '18-21' | '22-25' | '26-30'
  | '31-40' | '41-50' | '51-65' | '65+'
  | 'custom' | 'none';

export type SlangLevel = 'high' | 'medium' | 'low' | 'none';

export type RelationshipType =
  | 'romantic-partner' | 'crush' | 'close-friend'
  | 'casual-friend' | 'acquaintance' | 'family'
  | 'colleague' | 'manager' | 'client'
  | 'teacher' | 'student' | 'service'
  | 'older-person' | 'younger-person' | 'unknown'
  | 'custom';

export interface ToneSettings {
  tone: ToneType;
  ageStyle: AgeStyle;
  /** Used when ageStyle === 'custom'. Whole years only. */
  customAge: number | null;
  /** Free-text tone, used when tone === 'custom'. */
  customTone: string | null;
  slangLevel: SlangLevel;
  internetLanguage: boolean;
}

/** One-off tone applied to a single message, on top of the conversation style. */
export type MessageMood =
  | 'default' | 'funny' | 'dramatic' | 'affectionate'
  | 'excited' | 'apologetic' | 'serious' | 'assertive'
  | 'grateful' | 'custom';

export interface SpeakerProfile {
  name: string;
  age: number | null;
  gender: Gender | null;
  nativeLanguage: string;     // language code, e.g. "en", "es"
  apiKey: string;
  apiProvider: 'anthropic' | 'openai';
  /** 'hosted' uses the built-in translation engine; 'own' uses the user's API key. */
  aiBackend: 'hosted' | 'own';
  defaultTone: ToneSettings;
  /** How many alternative rewrites to return (1 or 3). */
  optionCount: 1 | 3;
  /** Whether the user has been asked about the option count preference. */
  hasSetOptionPreference: boolean;
}

export interface RecipientProfile {
  name: string;
  age: number | null;
  gender: Gender | null;
  relationship: RelationshipType;
  /** Free-text relationship, used when relationship === 'custom'. */
  customRelationship: string | null;
  sourceLanguage: string;     // language code — what the user will write in
  targetLanguage: string;     // language code — what to translate into
  dialect: string | null;
  /** Free-form city / region, e.g. "Torreón, Coahuila" — drives micro-regional speech. */
  region: string | null;
  /** Emoji override so users can pick the flag they identify with. */
  flagOverride: string | null;
  pronounSelf: string | null;
  pronounRecipient: string | null;
  formalityLevel: string | null;
  speechLevel: string | null;
  customNotes: string;
}

export type BubbleStyle = 'signal' | 'rounded' | 'square';
export type AccentTheme = 'violet' | 'teal' | 'indigo' | 'amber' | 'rose' | 'forest' | 'slate';
export type Wallpaper = 'none' | 'dots' | 'grid' | 'aurora' | 'waves' | 'paper';

export interface Appearance {
  accent: AccentTheme;
  bubbleStyle: BubbleStyle;
  wallpaper: Wallpaper;
  /** Bubble tint for the user's own messages. */
  outgoingTint: AccentTheme;
  compact: boolean;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  recipient: RecipientProfile;
  toneOverrides: Partial<ToneSettings> | null;
  pinned: boolean;
  /** Archived chats are hidden from the main list. */
  archived: boolean;
  /** Per-chat look, falls back to the global appearance when null. */
  appearance: Partial<Appearance> | null;
}

export interface BreakdownItem {
  phrase: string;
  romanization: string;
  meaning: string;
}

export interface VocabFlagged {
  word: string;
  romanization: string;
  meaning: string;
  importance: 'high' | 'medium';
}

/** One suggested rewrite. */
export interface TranslationOption {
  translation: string;
  romanization: string;
  /** Word-for-word meaning in the user's own language, so they know what they send. */
  literal: string;
  /** Short label such as "Warm", "Direct", "Playful". */
  style_label: string;
}

export interface Message {
  id: string;
  conversationId: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  sourceText: string;
  receivedText?: string;
  /** Chosen rewrite in the target language. */
  translation: string;
  /** Literal back-translation of the chosen rewrite. */
  literal?: string;
  romanization?: string;
  options?: TranslationOption[];
  selectedOption?: number;
  breakdown?: BreakdownItem[];
  vocabularyFlagged?: VocabFlagged[];
  toneNote?: string;
  inlineContext?: string;
  mood?: MessageMood;
  moodDetail?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  feedback?: 'up' | 'down' | null;
  feedbackDetail?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  romanization: string;
  meaning: string;
  language: string;
  sourceLanguage: string;
  exampleSentence: string;
  sourceConversationId: string;
  dateAdded: Date;
  userNote: string;
  studyStatus: 'new' | 'learning' | 'known';
}

export interface TranslationResponse {
  options: TranslationOption[];
  breakdown: BreakdownItem[];
  vocabulary: VocabFlagged[];
  tone_note: string;
}
