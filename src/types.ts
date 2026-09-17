/**
 * Configuration for the Formatter class, mirroring yii\i18n\Formatter properties.
 * All properties are optional - sensible defaults are applied when not provided.
 */
export interface FormatterOptions {
	/** Locale used by the Intl API (default: "en-US") */
	locale?: string

	/** Output time zone for date/time formatting (default: "UTC") */
	timeZone?: string

	/** Time zone assumed for input values without explicit timezone (default: "UTC") */
	defaultTimeZone?: string

	/** Default date format - ICU preset name or Intl options (default: "medium") */
	dateFormat?: string | Intl.DateTimeFormatOptions

	/** Default time format (default: "medium") */
	timeFormat?: string | Intl.DateTimeFormatOptions

	/** Default datetime format (default: "medium") */
	datetimeFormat?: string | Intl.DateTimeFormatOptions

	/** [falsyLabel, truthyLabel] (default: ["No", "Yes"]) */
	booleanFormat?: [string, string]

	/** String displayed when value is null/undefined (default: "(not set)") */
	nullDisplay?: string

	/** Default ISO 4217 currency code (default: "USD") */
	currencyCode?: string

	/** Custom decimal separator (null = use locale default) */
	decimalSeparator?: string | null

	/** Custom thousands separator (null = use locale default) */
	thousandSeparator?: string | null

	/** Custom decimal separator for currency (null = use locale default) */
	currencyDecimalSeparator?: string | null

	/** Base for file size calculation: 1024 (binary) or 1000 (decimal) */
	sizeFormatBase?: 1024 | 1000

	/** System of measurement units: "metric" or "imperial" */
	systemOfUnits?: "metric" | "imperial"

	/** Default number of decimal digits (null = auto) */
	defaultDecimalDigits?: number | null
}

/** ICU-style date/time format width presets */
export type DateFormatPreset = "short" | "medium" | "long" | "full"

/** Time units for Intl.RelativeTimeFormat */
export type RelativeTimeUnit =
	| "second"
	| "minute"
	| "hour"
	| "day"
	| "week"
	| "month"
	| "year"

/** System of measurement units */
export type UnitSystem = "metric" | "imperial"

/** Measurement unit category */
export type UnitType = "length" | "mass"

/** Format width for size/measurement output */
export type FormatWidth = "long" | "short"

/** Configuration for a single measurement unit */
export interface MeasureUnitConfig {
	factor: number
	longLabel: string
	shortLabel: string
}

/** Options for asEmail() */
export interface EmailOptions {
	/** Custom display text instead of the email address */
	text?: string
	/** Email subject line */
	subject?: string
	/** Email body content */
	body?: string
}

/** Options for asUrl() */
export interface UrlOptions {
	/** Target attribute for the link (default: "_blank") */
	target?: string
	/** Custom display text instead of the URL */
	text?: string
	/** Rel attribute for the link (e.g. "noopener noreferrer") */
	rel?: string
	/** CSS class(es) for the link element */
	class?: string
}

/** Options for asImage() */
export interface ImageOptions {
	/** Alt text for the image */
	alt?: string
	/** Image width (number for pixels, string for CSS value) */
	width?: number | string
	/** Image height (number for pixels, string for CSS value) */
	height?: number | string
	/** CSS class(es) for the image element */
	class?: string
	/** Loading strategy: "lazy" defers offscreen images, "eager" loads immediately */
	loading?: "lazy" | "eager"
}

/** Options for asParagraphs() */
export interface ParagraphOptions {
	/** HTML tag to wrap paragraphs (default: "p") */
	tag?: string
	/** Whether to convert single newlines within paragraphs to `<br />` (default: false) */
	lineBreaks?: boolean
}

/** Allowlist-based HTML sanitizer config */
export interface HtmlSanitizeConfig {
	/** Allowed HTML tags (e.g. ["b", "i", "a", "p", "br"]) */
	allowedTags?: string[]
	/** Allowed attributes per tag (e.g. { a: ["href", "target"] }) */
	allowedAttributes?: Record<string, string[]>
}

/** Ordinal suffix map for a language: PluralRule category -> suffix */
export type OrdinalSuffixMap = Record<string, string>

/** Options for asNumberShort() */
export interface NumberShortOptions {
	/** Number of decimal places (default: 1) */
	decimals?: number
	/** Fallback format when below smallest threshold: "currency" | "decimal" | "integer" (default: "currency") */
	fallback?: "currency" | "decimal" | "integer"
	/** Whether to add a space between number and suffix (default: false for backward compat) */
	spaceBefore?: boolean
}

/** Options for asGpsDistance() */
export interface GpsDistanceOptions {
	/** Output unit: "m" (meters), "km" (kilometers), "mi" (miles), "auto" (default: "auto") */
	unit?: "m" | "km" | "mi" | "auto"
	/** Number of decimal places (default: 1) */
	decimals?: number
	/** Earth radius in meters (default: 6371000) */
	earthRadius?: number
}

/** Options for asMaskedValue() */
export interface MaskOptions {
	/** Number of visible characters at the start (default: 4) */
	startVisible?: number
	/** Number of visible characters at the end (default: 3) */
	endVisible?: number
	/** Character used for masking (default: "X") */
	maskChar?: string
	/** Keep original character type (letters->letter mask, digits->digit mask). Currently uses maskChar for all. */
	preserveFormat?: boolean
}
