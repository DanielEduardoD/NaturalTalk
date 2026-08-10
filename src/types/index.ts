export type Gender = 'male' | 'female' | 'non-binary';
export type ToneType = 'gen-z' | 'casual' | 'flirty' | 'neutral' | 'formal';
export type AgeStyle = '18-21' | '22-25' | '26-30' | 'none';
export type SlangLevel = 'high' | 'medium' | 'low' | 'none';
export type RelationshipType =
  | 'romantic-partner' | 'crush' | 'close-friend'
  | 'casual-friend' | 'acquaintance' | 'older-person'
  | 'younger-person' | 'unknown';

export interface ToneSettings {
  tone: ToneType;
  ageStyle: AgeStyle;
  slangLevel: SlangLevel;
  internetLanguage: boolean;
}

export interface SpeakerProfile {
  name: string;
  age: number;
  gender: Gender;
  nativeLanguage: string;     // language code, e.g. "en", "es"
  apiKey: string;
  apiProvider: 'anthropic' | 'openai';
  defaultTone: ToneSettings;
}

export interface RecipientProfile {
  name: string;
  age: number | null;
  gender: Gender;
  relationship: RelationshipType;
  sourceLanguage: string;     // language code — what the user will write in
  targetLanguage: string;     // language code — what to translate into
  dialect: string | null;
  pronounSelf: string | null;
  pronounRecipient: string | null;
  formalityLevel: string | null;
  speechLevel: string | null;
  customNotes: string;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  recipient: RecipientProfile;
  toneOverrides: Partial<ToneSettings> | null;
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

export interface Message {
  id: string;
  conversationId: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  sourceText: string;
  receivedText?: string;
  translation: string;
  romanization?: string;
  breakdown?: BreakdownItem[];
  vocabularyFlagged?: VocabFlagged[];
  toneNote?: string;
  inlineContext?: string;
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
  translation: string;
  romanization?: string;
  breakdown: BreakdownItem[];
  vocabulary: VocabFlagged[];
  tone_note: string;
}
