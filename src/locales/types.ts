/**
 * Interface for locale-specific spellout and number-short providers.
 * Implement this to add a new language for asSpellout() and formatNumberShort().
 */
export interface LocaleSpellout {
	/** Convert an integer to words (e.g. 42 -> "forty-two") */
	integerToWords(n: number): string

	/** Convert a single digit to its word form (e.g. 5 -> "five") */
	digitToWord(digit: string): string

	/** The word for "point" used between integer and decimal parts */
	pointWord: string

	/** The word for "zero" */
	zeroWord: string

	/** The prefix for negative numbers (e.g. "minus", "am") */
	negativePrefix: string
}

/**
 * Short-number suffix configuration for a locale.
 * Used by formatNumberShort() to abbreviate large numbers.
 */
export interface NumberShortConfig {
	thresholds: Array<{
		value: number
		suffix: string
	}>
}

/** Registry of locale implementations keyed by language code. */
export type LocaleRegistry = Record<string, LocaleSpellout>
export type NumberShortRegistry = Record<string, NumberShortConfig>
