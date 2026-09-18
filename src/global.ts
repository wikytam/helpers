import { Formatter } from "./formatter.js"
import type { FormatterOptions } from "./types.js"
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
