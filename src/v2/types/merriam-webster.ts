/**
 * Types for Merriam-Webster Dictionary API
 * These types reflect the specific structure and strengths of Merriam-Webster Dictionary
 */

/**
 * Represents pronunciation data in Merriam-Webster format
 */
export interface MerriamWebsterPronunciation {
  /** Written pronunciation guide in Merriam-Webster format */
  written: string;
  /** Audio URL for pronunciation */
  audioUrl?: string;
  /** Phonetic transcription */
  phonetic?: string;
  /** Different forms of the word with their audio URLs (e.g., "did", "done", "doing", "does") */
  wordForms?: Array<{
    form: string;
    audioUrl: string;
  }>;
}

/**
 * Represents a sense number in Merriam-Webster's hierarchical numbering system
 */
export interface MerriamSenseNumber {
  /** Main number (e.g., "1", "2") */
  main: string;
  /** Optional sub-letter (e.g., "a", "b") */
  subLetter?: string;
  /** Optional sub-number (e.g., "1", "2") */
  subNumber?: string;
  /** Full rendered form of the sense number (e.g., "1a(2)") */
  fullForm: string;
}

/**
 * Represents a single example sentence illustrating word usage
 */
export interface MerriamExample {
  /** The example text */
  text: string;
  /** Optional attribution (source of the example) */
  attribution?: string;
  /** Optional type of example (literary, recent, historical) */
  type?: string;
}

/**
 * Represents a semantic label or subject field
 */
export interface MerriamLabel {
  /** Type of label (e.g., "subject", "register", "grammar") */
  type: string;
  /** The actual label text */
  text: string;
}

/**
 * Represents a single definition within a sense
 */
export interface MerriamDefinition {
  /** The sense number in Merriam-Webster's hierarchical system */
  senseNumber?: MerriamSenseNumber;
  /** The actual definition text */
  text: string;
  /** Example sentences */
  examples?: MerriamExample[];
  /** Special usage notes */
  usageNotes?: string[];
  /** Labels providing additional context */
  labels?: MerriamLabel[];
  /** Synonyms specific to this definition */
  synonyms?: string[];
  /** Antonyms specific to this definition */
  antonyms?: string[];
}

/**
 * Represents a group of related definitions with the same part of speech
 */
export interface MerriamPartOfSpeechSection {
  /** The part of speech (noun, verb, adjective, etc.) */
  partOfSpeech: string;
  /** Whether this is a functional label (e.g., "auxiliary verb") */
  functional?: boolean;
  /** Inflected forms (conjugations, plurals) */
  inflections?: string[];
  /** Definitions within this part of speech */
  definitions: MerriamDefinition[];
}

/**
 * Represents an etymological source or history of a word
 */
export interface MerriamEtymology {
  /** The etymology text */
  text: string;
  /** Language of origin */
  language?: string;
  /** Approximate year or period of first use */
  firstUse?: string;
}

/**
 * Represents a related phrase or idiom containing the word
 */
export interface MerriamRelatedPhrase {
  /** The text of the phrase */
  phrase: string;
  /** Brief definition of the phrase */
  definition: string;
  /** Examples of the phrase in use */
  examples?: MerriamExample[];
}

/**
 * Represents a complete dictionary entry for a word (homonym)
 */
export interface MerriamDictionaryEntry {
  /** The headword or term being defined */
  word: string;
  /** Homonym number if multiple entries exist with the same spelling */
  homonymNumber?: number;
  /** Indicates if the word has a specific variety (American, British) */
  variety?: string;
  /** Pronunciation information */
  pronunciation?: MerriamWebsterPronunciation;
  /** Functional label if applicable (e.g., "trademark") */
  functionalLabel?: string;
  /** Sections divided by part of speech */
  partOfSpeechSections: MerriamPartOfSpeechSection[];
  /** Etymology or word origin information */
  etymology?: MerriamEtymology;
  /** First known use information */
  firstKnownUse?: string;
  /** Related phrases, idioms, or collocations */
  relatedPhrases?: MerriamRelatedPhrase[];
  /** Other forms of the word (e.g., "plural", "past tense") */
  otherForms?: Record<string, string>;
}

/**
 * Response format for Merriam-Webster Dictionary API
 */
export interface MerriamWebsterDictionaryResponse {
  /** The word that was looked up */
  word: string;
  /** Dictionary entries found (may be multiple homonyms) */
  entries: MerriamDictionaryEntry[];
  /** Source name */
  source: string;
  /** Error message (if applicable) */
  error?: string;
  /** Suggested alternative spellings if word not found */
  suggestions?: string[];
}
