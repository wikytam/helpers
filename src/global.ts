import { Formatter } from "./formatter.js"
import type {
	CurrencyShortOptions,
	FormatterOptions,
	NumberShortOptions,
} from "./types.js"
import { parseDate } from "./utils.js"

/**
 * Global singleton Formatter instance.
 *
 * Usage: import once at app entry, configure once, then use `formatter` everywhere.
 *
 * ```ts
 * // main.ts (once)
 * import { configureFormatter } from "@template/helpers"
 * configureFormatter({ locale: "vi-VN", currencyCode: "VND" })
 *
 * // any-page.tsx (no setup needed)
 * import { formatter } from "@template/helpers"
 * formatter.asCurrency(1234567)
 * ```
 */
let instance = new Formatter()

/** The global Formatter singleton. Ready to use after `configureFormatter()`. */
export const formatter: Formatter = new Proxy({} as Formatter, {
	get(_target, prop, receiver) {
		return Reflect.get(instance, prop, receiver)
	},
})

/**
 * Configure the global formatter once (typically at app bootstrap).
 * Replaces the internal instance - all existing `formatter` references
 * automatically pick up the new config via the proxy.
 */
export function configureFormatter(options: FormatterOptions): void {
	instance = new Formatter(options)
}

/**
 * Format a date value safely for display using the global formatter.
 * Returns `fallback` (default: "\u2014") for null, undefined, empty, or invalid dates.
 * Uses the global formatter's `defaultTimeZone` to reinterpret Z-suffix strings.
 */
export function formatDate(
	date: string | Date | null | undefined,
	fallback = "\u2014",
): string {
	if (!date) return fallback
	try {
		const d = parseDate(date, instance.defaultTimeZone)
		if (Number.isNaN(d.getTime())) return fallback
		return formatter.asDate(d)
	} catch {
		return fallback
	}
}

/**
 * Format a value as a percentage for display using the global formatter.
 * - If the string already contains "%", returns it as-is.
 * - Values between 0 and 1 (exclusive) are treated as ratios (multiplied by 100).
 * - Returns `fallback` (default: "\u2014") for null/undefined/unparseable values.
 */
export function formatPercent(
	value: number | string | null | undefined,
	fallback = "\u2014",
): string {
	if (value === null || value === undefined) return fallback
	if (typeof value === "string") {
		if (value.trim() === "") return fallback
		if (value.includes("%")) return value
		const num = Number(value)
		if (Number.isNaN(num)) return value || fallback
		const pct = num > 0 && num <= 1 ? num * 100 : num
		return `${formatter.asDecimal(pct, 2)}%`
	}
	const pct = value > 0 && value <= 1 ? value * 100 : value
	return `${formatter.asDecimal(pct, 2)}%`
}

/**
 * Abbreviate a large number with locale-aware suffixes (e.g. 1500000 -> "1.5M" / "1,5 Triệu").
 * Standalone convenience wrapper around the global formatter instance.
 */
export function asNumberShort(
	value: unknown,
	options?: NumberShortOptions,
): string {
	return formatter.asNumberShort(value, options)
}

/**
 * Abbreviate a large currency value with locale-aware suffixes and currency symbol (e.g. 1500000 -> "1,50 Triệu ₫").
 * Standalone convenience wrapper around the global formatter instance.
 */
export function asCurrencyShort(
	value: unknown,
	options?: CurrencyShortOptions,
): string {
	return formatter.asCurrencyShort(value, options)
}

/**
 * Format a currency value using the global formatter (e.g. 1234.56 -> "$1,234.56" / "1.234,56 ₫").
 * Standalone convenience wrapper around the global formatter instance.
 */
export function asCurrency(value: unknown, currency?: string): string {
	return formatter.asCurrency(value, currency)
}

/**
 * Alias for `asCurrency()`.
 */
export function formatCurrency(value: unknown, currency?: string): string {
	return formatter.asCurrency(value, currency)
}

/**
 * Alias for `asCurrencyShort()`, providing backward compatibility for projects previously using `formatCurrencyCompact`.
 */
export function formatCurrencyCompact(
	value: unknown,
	options?: CurrencyShortOptions,
): string {
	return formatter.asCurrencyShort(value, options)
}

/**
 * Format an integer with grouping separators using the global formatter.
 */
export function asInteger(value: unknown): string {
	return formatter.asInteger(value)
}

/**
 * Format a decimal number with locale-aware separators and fixed decimal places using the global formatter.
 */
export function asDecimal(value: unknown, decimals?: number): string {
	return formatter.asDecimal(value, decimals)
}
