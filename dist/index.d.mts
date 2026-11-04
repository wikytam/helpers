/**
 * Configuration for the Formatter class, mirroring yii\i18n\Formatter properties.
 * All properties are optional - sensible defaults are applied when not provided.
 */
interface FormatterOptions {
  /** Locale used by the Intl API (default: "en-US") */
  locale?: string;
  /** Output time zone for date/time formatting (default: "UTC") */
  timeZone?: string;
  /** Time zone assumed for input values without explicit timezone (default: "UTC") */
  defaultTimeZone?: string;
  /** Default date format - ICU preset name or Intl options (default: "medium") */
  dateFormat?: string | Intl.DateTimeFormatOptions;
  /** Default time format (default: "medium") */
  timeFormat?: string | Intl.DateTimeFormatOptions;
  /** Default datetime format (default: "medium") */
  datetimeFormat?: string | Intl.DateTimeFormatOptions;
  /** [falsyLabel, truthyLabel] (default: ["No", "Yes"]) */
  booleanFormat?: [string, string];
  /** String displayed when value is null/undefined (default: "(not set)") */
  nullDisplay?: string;
  /** Default ISO 4217 currency code (default: "USD") */
  currencyCode?: string;
  /** Custom decimal separator (null = use locale default) */
  decimalSeparator?: string | null;
  /** Custom thousands separator (null = use locale default) */
  thousandSeparator?: string | null;
  /** Custom decimal separator for currency (null = use locale default) */
  currencyDecimalSeparator?: string | null;
  /** Base for file size calculation: 1024 (binary) or 1000 (decimal) */
  sizeFormatBase?: 1024 | 1000;
  /** System of measurement units: "metric" or "imperial" */
  systemOfUnits?: "metric" | "imperial";
  /** Default number of decimal digits (null = auto) */
  defaultDecimalDigits?: number | null;
}
/** ICU-style date/time format width presets */
type DateFormatPreset = "short" | "medium" | "long" | "full";
/** Time units for Intl.RelativeTimeFormat */
type RelativeTimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
/** System of measurement units */
type UnitSystem = "metric" | "imperial";
/** Measurement unit category */
type UnitType = "length" | "mass";
/** Format width for size/measurement output */
type FormatWidth = "long" | "short";
/** Configuration for a single measurement unit */
interface MeasureUnitConfig {
  factor: number;
  longLabel: string;
  shortLabel: string;
}
/** Options for asEmail() */
interface EmailOptions {
  /** Custom display text instead of the email address */
  text?: string;
  /** Email subject line */
  subject?: string;
  /** Email body content */
  body?: string;
}
/** Options for asUrl() */
interface UrlOptions {
  /** Target attribute for the link (default: "_blank") */
  target?: string;
  /** Custom display text instead of the URL */
  text?: string;
  /** Rel attribute for the link (e.g. "noopener noreferrer") */
  rel?: string;
  /** CSS class(es) for the link element */
  class?: string;
}
/** Options for asImage() */
interface ImageOptions {
  /** Alt text for the image */
  alt?: string;
  /** Image width (number for pixels, string for CSS value) */
  width?: number | string;
  /** Image height (number for pixels, string for CSS value) */
  height?: number | string;
  /** CSS class(es) for the image element */
  class?: string;
  /** Loading strategy: "lazy" defers offscreen images, "eager" loads immediately */
  loading?: "lazy" | "eager";
}
/** Options for asParagraphs() */
interface ParagraphOptions {
  /** HTML tag to wrap paragraphs (default: "p") */
  tag?: string;
  /** Whether to convert single newlines within paragraphs to `<br />` (default: false) */
  lineBreaks?: boolean;
}
/** Allowlist-based HTML sanitizer config */
interface HtmlSanitizeConfig {
  /** Allowed HTML tags (e.g. ["b", "i", "a", "p", "br"]) */
  allowedTags?: string[];
  /** Allowed attributes per tag (e.g. { a: ["href", "target"] }) */
  allowedAttributes?: Record<string, string[]>;
}
/** Ordinal suffix map for a language: PluralRule category -> suffix */
type OrdinalSuffixMap = Record<string, string>;
/** Options for asNumberShort() */
interface NumberShortOptions {
  /** Number of decimal places (default: 1) */
  decimals?: number;
  /** Fallback format when below smallest threshold: "currency" | "decimal" | "integer" (default: "currency") */
  fallback?: "currency" | "decimal" | "integer";
  /** Whether to add a space between number and suffix (default: false for backward compat) */
  spaceBefore?: boolean;
}
/** Options for asCurrencyShort() */
interface CurrencyShortOptions {
  /** Number of decimal places (default: 2) */
  decimals?: number;
  /** ISO 4217 currency code override (default: use instance currencyCode) */
  currency?: string;
  /** Whether to add a space between number and suffix (default: false for backward compat) */
  spaceBefore?: boolean;
}
/** Options for asGpsDistance() */
interface GpsDistanceOptions {
  /** Output unit: "m" (meters), "km" (kilometers), "mi" (miles), "auto" (default: "auto") */
  unit?: "m" | "km" | "mi" | "auto";
  /** Number of decimal places (default: 1) */
  decimals?: number;
  /** Earth radius in meters (default: 6371000) */
  earthRadius?: number;
}
/** Options for asMaskedValue() */
interface MaskOptions {
  /** Number of visible characters at the start (default: 4) */
  startVisible?: number;
  /** Number of visible characters at the end (default: 3) */
  endVisible?: number;
  /** Character used for masking (default: "X") */
  maskChar?: string;
  /** Keep original character type (letters->letter mask, digits->digit mask). Currently uses maskChar for all. */
  preserveFormat?: boolean;
}
/**
 * TypeScript port of yii\i18n\Formatter.
 *
 * Uses only built-in Intl APIs - zero external dependencies.
 * Supports: strings, HTML, numbers, currency, dates, times,
 * file sizes, measurement units, and more.
 */
export declare class Formatter {
  locale: string;
  timeZone: string;
  defaultTimeZone: string;
  dateFormat: string | Intl.DateTimeFormatOptions;
  timeFormat: string | Intl.DateTimeFormatOptions;
  datetimeFormat: string | Intl.DateTimeFormatOptions;
  booleanFormat: [string, string];
  nullDisplay: string;
  currencyCode: string;
  decimalSeparator: string | null;
  thousandSeparator: string | null;
  currencyDecimalSeparator: string | null;
  sizeFormatBase: 1024 | 1000;
  systemOfUnits: UnitSystem;
  defaultDecimalDigits: number | null;
  constructor(options?: FormatterOptions);
  /**
   * Format a value by type name, like Yii2's `$formatter->format($value, 'date')`.
   * Supports both string and tuple `[formatName, ...params]` signatures.
   */
  format(value: unknown, type: string | [string, ...unknown[]]): string;
  /** Returns the value as-is without any formatting. */
  asRaw(value: unknown): string;
  /** Formats the value as HTML-encoded plain text. */
  asText(value: unknown): string;
  /**
   * Formats the value as HTML-encoded text with newlines converted to `<br />`.
   * Handles all line-ending variants: `\r\n` (Windows), `\r` (old Mac), `\n` (Unix).
   * Consecutive newlines produce multiple `<br />` tags.
   */
  asNtext(value: unknown): string;
  /**
   * Formats the value as HTML-encoded text paragraphs (split by double newlines).
   * Supports configurable wrapper tag and inline line-break conversion.
   */
  asParagraphs(value: unknown, options?: ParagraphOptions): string;
  /**
   * Returns the value as HTML text.
   * When a sanitize config is provided, only allowed tags and attributes are kept.
   * Without config, the value is returned as-is (caller is responsible for safety).
   */
  asHtml(value: unknown, sanitize?: HtmlSanitizeConfig): string;
  /**
   * Allowlist-based HTML sanitizer. Strips tags and attributes not in the config.
   * Handles self-closing tags, nested tags, and attribute filtering.
   */
  private static sanitizeHtml;
  /**
   * Formats the value as a mailto link.
   * Supports custom display text, subject, and body parameters.
   * Validates email format - returns escaped plain text for invalid emails.
   */
  asEmail(value: unknown, options?: EmailOptions): string;
  /** Basic email format validation (covers most common patterns). */
  private static isValidEmail;
  /**
   * Formats the value as a hyperlink.
   * Detects http, https, ftp, ftps, and mailto schemes.
   * Prepends `http://` when no recognized scheme is present.
   */
  asUrl(value: unknown, options?: UrlOptions): string;
  /**
   * Formats the value as an image tag.
   * Supports width, height, CSS class, and loading strategy attributes.
   */
  asImage(value: unknown, options?: ImageOptions): string;
  /** Formats the value as a boolean using the configured booleanFormat labels. */
  asBoolean(value: unknown): string;
  /** Formats the value as an integer by removing decimal digits without rounding. */
  asInteger(value: unknown): string;
  /** Formats the value as a decimal number. */
  asDecimal(value: unknown, decimals?: number): string;
  /** Formats the value as a percent number with "%" sign. */
  asPercent(value: unknown, decimals?: number): string;
  /** Formats the value as a currency number using ISO 4217 codes. */
  asCurrency(value: unknown, currency?: string): string;
  /** Formats the value as a scientific number (e-notation). */
  asScientific(value: unknown, decimals?: number): string;
  /**
   * Formats the value as a number spellout (e.g. 42 -> "forty-two").
   * Supports multiple locales via the locales/ registry.
   */
  asSpellout(value: unknown): string;
  /**
   * Formats the value as an ordinal number (e.g. 1 -> "1st", 2 -> "2nd").
   * Supports multiple locales via built-in suffix maps and custom overrides
   * through `Formatter.registerOrdinalSuffixes()`.
   */
  asOrdinal(value: unknown): string;
  /** Built-in ordinal suffix registry. Extensible at runtime. */
  private static ordinalSuffixes;
  /**
   * Register ordinal suffixes for a language at runtime.
   * Keys are Intl.PluralRules ordinal categories: "one", "two", "few", "other".
   */
  static registerOrdinalSuffixes(lang: string, suffixes: OrdinalSuffixMap): void;
  /** Formats the value as a date. */
  asDate(value: unknown, format?: string | Intl.DateTimeFormatOptions): string;
  /** Formats the value as a time. */
  asTime(value: unknown, format?: string | Intl.DateTimeFormatOptions): string;
  /** Formats the value as a datetime. */
  asDatetime(value: unknown, format?: string | Intl.DateTimeFormatOptions): string;
  /** Returns the value as a UNIX timestamp (seconds since epoch). */
  asTimestamp(value: unknown): string;
  /**
   * Formats the value as the time interval between a date and now in human readable form.
   * Uses Intl.RelativeTimeFormat (built-in in Node.js / browsers).
   */
  asRelativeTime(value: unknown, referenceTime?: unknown): string;
  /**
   * Represents the value as duration in human readable format.
   * Example: 5400 -> "1 hour, 30 minutes"
   */
  asDuration(value: unknown, implode?: string): string;
  /** Formats the value in bytes as a size in human readable form (e.g. "12 kilobytes"). */
  asSize(value: unknown, decimals?: number): string;
  /** Formats the value in bytes as a size in human readable form (e.g. "12 kB"). */
  asShortSize(value: unknown, decimals?: number): string;
  /** Formats the value as a length in human readable form (e.g. "12 meters"). */
  asLength(value: unknown, decimals?: number): string;
  /** Formats the value as a length in human readable form (e.g. "12 m"). */
  asShortLength(value: unknown, decimals?: number): string;
  /** Formats the value as a weight in human readable form (e.g. "12 kilograms"). */
  asWeight(value: unknown, decimals?: number): string;
  /** Formats the value as a weight in human readable form (e.g. "12 kg"). */
  asShortWeight(value: unknown, decimals?: number): string;
  /**
   * Abbreviate a large number with locale-aware suffixes.
   * e.g. 1500000 -> "1.5 Million" (en) or "1,5 Trieu" (vi).
   */
  asNumberShort(value: unknown, options?: NumberShortOptions): string;
  /**
   * Abbreviate a large currency value with locale-aware suffixes and currency symbol.
   * e.g. 1500000 -> "1,50 Triệu ₫" (vi-VN/VND) or "$1.50 Million" (en-US/USD).
   *
   * Uses `asNumberShort()` for the abbreviated number, then appends the
   * currency symbol resolved from `Intl.NumberFormat`.
   */
  asCurrencyShort(value: unknown, options?: CurrencyShortOptions): string;
  /**
   * Format the GPS (great-circle) distance between two coordinates.
   * Returns a human-readable string with unit suffix.
   */
  asGpsDistance(latFrom: number, lonFrom: number, latTo: number, lonTo: number, options?: GpsDistanceOptions): string;
  /** Haversine formula: returns distance in meters between two GPS coordinates. */
  private static gpsDistance;
  /**
   * Mask a string value, showing only the first and last N characters.
   * Instance method with options support.
   */
  asMaskedValue(value: unknown, options?: MaskOptions): string;
  /** Core masking logic used by asMaskedValue(). */
  private static getMaskedValue;
  /**
   * Format bytes into the most appropriate size unit.
   * Supports both base-1024 (binary) and base-1000 (decimal).
   */
  private formatBytes;
  /**
   * Format a measurement value (length or mass).
   * Automatically selects the most appropriate unit based on value magnitude.
   */
  private formatMeasure;
  /** Get measurement unit configs for the configured system (metric/imperial). */
  private getMeasureUnits;
  /** Format the numeric part of a result using locale-aware Intl. */
  private formatNumberPart;
  /** Create a locale-aware duration label using Intl unit formatting. */
  private getDurationLabel;
  /** English ordinal suffix fallback. */
  private getOrdinalSuffixEn;
}
/** The global Formatter singleton. Ready to use after `configureFormatter()`. */
export declare const formatter: Formatter;
/**
 * Configure the global formatter once (typically at app bootstrap).
 * Replaces the internal instance - all existing `formatter` references
 * automatically pick up the new config via the proxy.
 */
export declare function configureFormatter(options: FormatterOptions): void;
/**
 * Format a date value safely for display using the global formatter.
 * Returns `fallback` (default: "\u2014") for null, undefined, empty, or invalid dates.
 * Uses the global formatter's `defaultTimeZone` to reinterpret Z-suffix strings.
 */
export declare function formatDate(date: string | Date | null | undefined, fallback?: string): string;
/**
 * Format a value as a percentage for display using the global formatter.
 * - If the string already contains "%", returns it as-is.
 * - Values between 0 and 1 (exclusive) are treated as ratios (multiplied by 100).
 * - Returns `fallback` (default: "\u2014") for null/undefined/unparseable values.
 */
export declare function formatPercent(value: number | string | null | undefined, fallback?: string): string;
/**
 * Abbreviate a large number with locale-aware suffixes (e.g. 1500000 -> "1.5M" / "1,5 Triệu").
 * Standalone convenience wrapper around the global formatter instance.
 */
export declare function asNumberShort(value: unknown, options?: NumberShortOptions): string;
/**
 * Abbreviate a large currency value with locale-aware suffixes and currency symbol (e.g. 1500000 -> "1,50 Triệu ₫").
 * Standalone convenience wrapper around the global formatter instance.
 */
export declare function asCurrencyShort(value: unknown, options?: CurrencyShortOptions): string;
/**
 * Format a currency value using the global formatter (e.g. 1234.56 -> "$1,234.56" / "1.234,56 ₫").
 * Standalone convenience wrapper around the global formatter instance.
 */
export declare function asCurrency(value: unknown, currency?: string): string;
/**
 * Alias for `asCurrency()`.
 */
export declare function formatCurrency(value: unknown, currency?: string): string;
/**
 * Alias for `asCurrencyShort()`, providing backward compatibility for projects previously using `formatCurrencyCompact`.
 */
export declare function formatCurrencyCompact(value: unknown, options?: CurrencyShortOptions): string;
/**
 * Format an integer with grouping separators using the global formatter.
 */
export declare function asInteger(value: unknown): string;
/**
 * Format a decimal number with locale-aware separators and fixed decimal places using the global formatter.
 */
export declare function asDecimal(value: unknown, decimals?: number): string;
/**
 * Interface for locale-specific spellout and number-short providers.
 * Implement this to add a new language for asSpellout() and formatNumberShort().
 */
interface LocaleSpellout {
  /** Convert an integer to words (e.g. 42 -> "forty-two") */
  integerToWords(n: number): string;
  /** Convert a single digit to its word form (e.g. 5 -> "five") */
  digitToWord(digit: string): string;
  /** The word for "point" used between integer and decimal parts */
  pointWord: string;
  /** The word for "zero" */
  zeroWord: string;
  /** The prefix for negative numbers (e.g. "minus", "am") */
  negativePrefix: string;
}
/**
 * Short-number suffix configuration for a locale.
 * Used by formatNumberShort() to abbreviate large numbers.
 */
interface NumberShortConfig {
  thresholds: Array<{
    value: number;
    suffix: string;
  }>;
}
/** Get the spellout provider for a locale, falling back to English. */
export declare function getSpellout(locale: string): LocaleSpellout;
/** Get the number-short config for a locale, falling back to English. */
export declare function getNumberShortConfig(locale: string): NumberShortConfig;
/** Register a custom spellout locale at runtime. */
export declare function registerSpellout(lang: string, impl: LocaleSpellout): void;
/** Register a custom number-short config at runtime. */
export declare function registerNumberShort(lang: string, config: NumberShortConfig): void;
/**
 * Escape the 5 HTML-special characters, equivalent to PHP's htmlspecialchars().
 * No external dependency - pure string replacement.
 */
export declare function escapeHtml(value: string): string;
/**
 * Get the UTC offset string (e.g. "+07:00") for an IANA timezone name
 * at the given reference date, using only built-in Intl APIs.
 */
export declare function getIANAOffset(iana: string, refDate: Date): string;
/**
 * Normalize an input value into a Date object.
 * Accepts: Date, number (UNIX seconds or milliseconds), string (ISO 8601).
 *
 * When `defaultTimeZone` is provided and differs from "UTC", ISO strings
 * ending with "Z" are reinterpreted as being in that timezone instead of UTC.
 * This handles the common case where backends (Drizzle, Prisma, etc.) append
 * "Z" to timestamps that are actually stored in local time.
 */
export declare function normalizeDate(value: unknown, defaultTimeZone?: string): Date;
/**
 * Parse a date string safely for display, with optional timezone reinterpretation.
 *
 * - Strings like "2024-03-15T14:30:00" (no Z, no +offset) get "Z" appended
 *   to ensure consistent UTC interpretation across environments.
 * - When `defaultTimeZone` is set and differs from "UTC", Z-suffix strings
 *   are reinterpreted as being in that timezone (same logic as normalizeDate).
 * - Returns an Invalid Date (NaN) for null, undefined, or empty values
 *   instead of throwing - suitable for display pipelines.
 */
export declare function parseDate(date: string | Date | null | undefined, defaultTimeZone?: string): Date;
/**
 * Normalize an input value into a number.
 * Accepts: number, numeric string (with optional comma grouping), boolean.
 */
export declare function normalizeNumber(value: unknown): number;
export type { CurrencyShortOptions, DateFormatPreset, EmailOptions, FormatWidth, FormatterOptions, GpsDistanceOptions, HtmlSanitizeConfig, ImageOptions, LocaleSpellout, MaskOptions, MeasureUnitConfig, NumberShortConfig, NumberShortOptions, OrdinalSuffixMap, ParagraphOptions, RelativeTimeUnit, UnitSystem, UnitType, UrlOptions };
//# sourceMappingURL=index.d.mts.map