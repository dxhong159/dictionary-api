/**
 * Types for Cambridge Dictionary API
 * These types reflect the specific structure of Cambridge Dictionary data
 */

/**
 * Represents pronunciation data with audio URLs for British and American English
 */
export interface CambridgePronunciation {
  /** International Phonetic Alphabet for British English */
  ukIpa?: string;
  /** International Phonetic Alphabet for American English */
  usIpa?: string;
  /** Audio URL for British English pronunciation */
  ukAudioUrl?: string;
  /** Audio URL for American English pronunciation */
  usAudioUrl?: string;
}

/**
 * Represents a single example sentence for a definition
 */
export interface CambridgeExample {
  /** The example sentence text */
  text: string;
  /** Optional translation of the example (if available) */
  translation?: string;
}

/**
 * Represents a level indicator (e.g., B2, C1) for a definition
 */
export interface CambridgeLevel {
  /** The CEFR level code (A1, A2, B1, B2, C1, C2) */
  code: string;
  /** Full description of the level */
  description?: string;
}

/**
 * Represents a single definition of a word or phrase
 */
export interface CambridgeDefinition {
  /** The actual definition text */
  text: string;
  /** Example sentences demonstrating usage */
  examples?: CambridgeExample[];
  /** Cambridge English level indicator */
  level?: CambridgeLevel;
  /** Domain or subject area (e.g., "Business") */
  domain?: string;
  /** Register information (e.g., "formal", "informal") */
  register?: string;
  /** Grammar notes or patterns */
  grammar?: string;
  /** Usage labels (e.g., "disapproving", "old-fashioned") */
  labels?: string[];
  /** Alternate forms of the term in this definition */
  alternates?: string[];
  /** UK/US variations in meaning (if applicable) */
  regionVariation?: {
    uk?: string;
    us?: string;
  };
}

/**
 * Represents a group of related definitions with the same part of speech
 */
export interface CambridgeDefGroup {
  /** The part of speech (noun, verb, adjective, etc.) */
  partOfSpeech: string;
  /** The definitions within this group */
  definitions: CambridgeDefinition[];
  /** Additional level or subject area for the entire group */
  groupLevel?: CambridgeLevel;
  /** Additional grammar notes for the entire group */
  grammarInfo?: string;
  /** British/American variations in the entire group */
  regionNote?: string;
}

/**
 * Represents an idiom or phrasal verb related to the word
 */
export interface CambridgeRelatedPhrase {
  /** The text of the phrase */
  phrase: string;
  /** Brief definition */
  definition: string;
  /** Example usage */
  example?: string;
  /** Link to full entry for this phrase */
  link?: string;
}

/**
 * Represents a complete dictionary entry for a word
 */
export interface CambridgeDictionaryEntry {
  /** The word or phrase being defined */
  word: string;
  /** Main pronunciation information */
  pronunciation?: CambridgePronunciation;
  /** Definition groups by part of speech */
  defGroups: CambridgeDefGroup[];
  /** Alternative forms of the word */
  alternativeForms?: string[];
  /** Related phrases and idioms */
  relatedPhrases?: CambridgeRelatedPhrase[];
  /** Phrasal verbs related to this word */
  phrasalVerbs?: CambridgeRelatedPhrase[];
  /** Idioms containing this word */
  idioms?: CambridgeRelatedPhrase[];
}

/**
 * Response format for Cambridge Dictionary API
 */
export interface CambridgeDictionaryResponse {
  /** The word that was looked up */
  word: string;
  /** Dictionary entries found */
  entries: CambridgeDictionaryEntry[];
  /** Source name */
  source: string;
  /** Error message (if applicable) */
  error?: string;
}
