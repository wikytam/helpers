import type { DateFormatPreset } from "./types.js"

/**
 * Escape the 5 HTML-special characters, equivalent to PHP's htmlspecialchars().
 * No external dependency - pure string replacement.
 */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
}

/**
 * Parse a "GMT+7" / "GMT-5:30" / "GMT" style string from Intl into a
 * standard offset like "+07:00" / "-05:30" / "+00:00".
 */
function parseGMTOffset(gmtStr: string): string {
	// "GMT" alone means +00:00
	if (gmtStr === "GMT" || gmtStr === "UTC") return "+00:00"

	const match = gmtStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
	if (!match) return "+00:00"

	const sign = match[1]
	const hours = (match[2] ?? "0").padStart(2, "0")
	const minutes = (match[3] ?? "0").padStart(2, "0")
	return `${sign}${hours}:${minutes}`
}

/**
 * Get the UTC offset string (e.g. "+07:00") for an IANA timezone name
 * at the given reference date, using only built-in Intl APIs.
 */
export function getIANAOffset(iana: string, refDate: Date): string {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone: iana,
		timeZoneName: "shortOffset",
	})
	const parts = fmt.formatToParts(refDate)
	const tzPart = parts.find((p) => p.type === "timeZoneName")
	return parseGMTOffset(tzPart?.value ?? "GMT")
}

/**
 * Normalize an input value into a Date object.
 * Accepts: Date, number (UNIX seconds or milliseconds), string (ISO 8601).
 *
 * When `defaultTimeZone` is provided and differs from "UTC", ISO strings
 * ending with "Z" are reinterpreted as being in that timezone instead of UTC.
 * This handles the common case where backends (Drizzle, Prisma, etc.) append
 * "Z" to timestamps that are actually stored in local time.
 */
export function normalizeDate(value: unknown, defaultTimeZone?: string): Date {
	if (value instanceof Date) return value

	if (typeof value === "number") {
		// Values below 1e12 are treated as seconds, otherwise milliseconds
		return new Date(value < 1e12 ? value * 1000 : value)
	}

	if (typeof value === "string") {
		let str = value
		// Reinterpret Z-suffix strings when defaultTimeZone is not UTC
		if (
			defaultTimeZone &&
			defaultTimeZone !== "UTC" &&
			str.includes("T") &&
			str.endsWith("Z")
		) {
			const offset = getIANAOffset(defaultTimeZone, new Date(str))
			str = str.slice(0, -1) + offset
		}

		const parsed = new Date(str)
		if (Number.isNaN(parsed.getTime())) {
			throw new Error(`Cannot parse date value: "${value}"`)
		}
		return parsed
	}

	throw new Error(`Invalid data type for date: ${typeof value}`)
}

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
export function parseDate(
	date: string | Date | null | undefined,
	defaultTimeZone?: string,
): Date {
	if (!date) return new Date(Number.NaN)
	if (date instanceof Date) return date
	let str = date

	// Reinterpret Z-suffix strings when defaultTimeZone is not UTC
	if (
		defaultTimeZone &&
		defaultTimeZone !== "UTC" &&
		str.includes("T") &&
		str.endsWith("Z")
	) {
		const offset = getIANAOffset(defaultTimeZone, new Date(str))
		str = str.slice(0, -1) + offset
	} else if (!str.endsWith("Z") && !str.includes("+") && str.includes("T")) {
		// Timezone-naive ISO string: treat as UTC
		str += "Z"
	}

	return new Date(str)
}

/**
 * Normalize an input value into a number.
 * Accepts: number, numeric string (with optional comma grouping), boolean.
 */
export function normalizeNumber(value: unknown): number {
	if (typeof value === "number") return value

	if (typeof value === "string") {
		const trimmed = value.trim()
		// Strip common thousand separators before parsing
		const cleaned = trimmed.replace(/,/g, "")
		const num = Number(cleaned)
		if (Number.isNaN(num)) {
			throw new Error(`Cannot parse numeric value: "${value}"`)
		}
		return num
	}

	if (typeof value === "boolean") return value ? 1 : 0

	throw new Error(`Invalid data type for number: ${typeof value}`)
}

/**
 * Convert a preset name (short/medium/long/full) to Intl.DateTimeFormatOptions.
 */
export function presetToDateOptions(
	preset: DateFormatPreset,
	type: "date" | "time" | "datetime",
): Intl.DateTimeFormatOptions {
	const dateOptions: Record<DateFormatPreset, Intl.DateTimeFormatOptions> = {
		short: { year: "2-digit", month: "numeric", day: "numeric" },
		medium: { year: "numeric", month: "short", day: "numeric" },
		long: { year: "numeric", month: "long", day: "numeric" },
		full: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
	}

	const timeOptions: Record<DateFormatPreset, Intl.DateTimeFormatOptions> = {
		short: { hour: "numeric", minute: "numeric" },
		medium: { hour: "numeric", minute: "numeric", second: "numeric" },
		long: {
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			timeZoneName: "short",
		},
		full: {
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			timeZoneName: "long",
		},
	}

	switch (type) {
		case "date":
			return dateOptions[preset] ?? dateOptions.medium
		case "time":
			return timeOptions[preset] ?? timeOptions.medium
		case "datetime":
			return {
				...(dateOptions[preset] ?? dateOptions.medium),
				...(timeOptions[preset] ?? timeOptions.medium),
			}
	}
}

/**
 * Resolve a format value: string preset -> Intl options, object -> use directly.
 */
export function resolveDateFormat(
	format: string | Intl.DateTimeFormatOptions | undefined,
	defaultPreset: DateFormatPreset,
	type: "date" | "time" | "datetime",
): Intl.DateTimeFormatOptions {
	if (!format) return presetToDateOptions(defaultPreset, type)
	if (typeof format === "object") return format
	return presetToDateOptions(format as DateFormatPreset, type)
}

/**
 * Replace locale-default separators with custom ones in a formatted string.
 * Uses temporary placeholders to avoid replacement collisions.
 */
export function applyCustomSeparators(
	formatted: string,
	locale: string,
	customDecimal?: string | null,
	customThousand?: string | null,
): string {
	if (customDecimal == null && customThousand == null) return formatted

	// Detect locale-default separators
	const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89)
	const localeDecimal = parts.find((p) => p.type === "decimal")?.value ?? "."
	const localeGroup = parts.find((p) => p.type === "group")?.value ?? ","

	let result = formatted

	// Temporary placeholders to prevent collision during replacement
	const PLACEHOLDER_DEC = "\x01"
	const PLACEHOLDER_GRP = "\x02"

	if (customDecimal != null) {
		result = result.replaceAll(localeDecimal, PLACEHOLDER_DEC)
	}
	if (customThousand != null) {
		result = result.replaceAll(localeGroup, PLACEHOLDER_GRP)
	}
	if (customDecimal != null) {
		result = result.replaceAll(PLACEHOLDER_DEC, customDecimal)
	}
	if (customThousand != null) {
		result = result.replaceAll(PLACEHOLDER_GRP, customThousand)
	}

	return result
}
