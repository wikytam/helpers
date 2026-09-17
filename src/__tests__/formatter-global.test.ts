import { describe, expect, it } from "vitest"
import {
	configureFormatter,
	formatDate,
	formatPercent,
	formatter,
} from "../global.js"
import { parseDate } from "../utils.js"

describe("Global formatter singleton", () => {
	it("works with default config out of the box", () => {
		configureFormatter({})
		expect(formatter.asBoolean(true)).toBe("Yes")
		expect(formatter.asCurrency(1234.56)).toBe("$1,234.56")
	})

	it("picks up new config after configureFormatter()", () => {
		configureFormatter({
			locale: "vi-VN",
			currencyCode: "VND",
			booleanFormat: ["Kh\u00f4ng", "C\u00f3"],
		})

		expect(formatter.asBoolean(true)).toBe("C\u00f3")
		expect(formatter.asBoolean(false)).toBe("Kh\u00f4ng")
		expect(formatter.locale).toBe("vi-VN")
	})

	it("re-configuring replaces the instance transparently", () => {
		configureFormatter({ locale: "en-US", currencyCode: "USD" })
		expect(formatter.locale).toBe("en-US")

		configureFormatter({ locale: "ja-JP", currencyCode: "JPY" })
		expect(formatter.locale).toBe("ja-JP")
		expect(formatter.currencyCode).toBe("JPY")
	})

	it("all Formatter methods are accessible via proxy", () => {
		configureFormatter({ locale: "en-US" })

		expect(formatter.asInteger(1234)).toBe("1,234")
		expect(formatter.asDecimal(1.5)).toBe("1.50")
		expect(formatter.asText("<b>hi</b>")).toBe("&lt;b&gt;hi&lt;/b&gt;")
		expect(formatter.asDate("2024-03-15")).toContain("2024")
		expect(formatter.asSpellout(42)).toBe("forty-two")
	})
})

// ─── parseDate() ──────────────────────────────────────────────────

describe("parseDate()", () => {
	it("returns Invalid Date for null", () => {
		expect(Number.isNaN(parseDate(null).getTime())).toBe(true)
	})

	it("returns Invalid Date for undefined", () => {
		expect(Number.isNaN(parseDate(undefined).getTime())).toBe(true)
	})

	it("returns Invalid Date for empty string", () => {
		expect(Number.isNaN(parseDate("").getTime())).toBe(true)
	})

	it("passes through Date objects", () => {
		const d = new Date("2024-03-15T14:30:00Z")
		expect(parseDate(d)).toBe(d)
	})

	it("appends Z to timezone-naive ISO strings", () => {
		const result = parseDate("2024-03-15T14:30:00")
		expect(result.toISOString()).toBe("2024-03-15T14:30:00.000Z")
	})

	it("does not modify strings already having Z", () => {
		const result = parseDate("2024-03-15T14:30:00Z")
		expect(result.toISOString()).toBe("2024-03-15T14:30:00.000Z")
	})

	it("does not modify strings with timezone offset", () => {
		const result = parseDate("2024-03-15T14:30:00+07:00")
		expect(result.toISOString()).toBe("2024-03-15T07:30:00.000Z")
	})

	it("handles date-only strings", () => {
		const result = parseDate("2024-03-15")
		expect(result.getFullYear()).toBe(2024)
	})
})

// ─── formatDate() ─────────────────────────────────────────────────

describe("formatDate()", () => {
	it("returns fallback for null", () => {
		expect(formatDate(null)).toBe("\u2014")
	})

	it("returns fallback for undefined", () => {
		expect(formatDate(undefined)).toBe("\u2014")
	})

	it("returns fallback for empty string", () => {
		expect(formatDate("")).toBe("\u2014")
	})

	it("returns fallback for invalid date string", () => {
		expect(formatDate("not-a-date")).toBe("\u2014")
	})

	it("supports custom fallback", () => {
		expect(formatDate(null, "N/A")).toBe("N/A")
	})

	it("formats valid ISO date string", () => {
		configureFormatter({ locale: "en-US", timeZone: "UTC" })
		const result = formatDate("2024-03-15T14:30:00Z")
		expect(result).toContain("2024")
		expect(result).toContain("Mar")
	})

	it("formats timezone-naive string as UTC", () => {
		configureFormatter({ locale: "en-US", timeZone: "UTC" })
		const result = formatDate("2024-03-15T14:30:00")
		expect(result).toContain("2024")
	})

	it("formats Date objects", () => {
		configureFormatter({ locale: "en-US", timeZone: "UTC" })
		const result = formatDate(new Date("2024-03-15T14:30:00Z"))
		expect(result).toContain("2024")
	})
})

// ─── formatPercent() ──────────────────────────────────────────────

describe("formatPercent()", () => {
	it("returns fallback for null", () => {
		expect(formatPercent(null)).toBe("\u2014")
	})

	it("returns fallback for undefined", () => {
		expect(formatPercent(undefined)).toBe("\u2014")
	})

	it("returns string as-is if it contains %", () => {
		expect(formatPercent("45.5%")).toBe("45.5%")
	})

	it("treats numeric values 0-1 as ratios", () => {
		configureFormatter({ locale: "en-US" })
		expect(formatPercent(0.156)).toBe("15.60%")
		expect(formatPercent(0.5)).toBe("50.00%")
		expect(formatPercent(1)).toBe("100.00%")
	})

	it("treats values > 1 as already percentage", () => {
		configureFormatter({ locale: "en-US" })
		expect(formatPercent(45)).toBe("45.00%")
		expect(formatPercent(100)).toBe("100.00%")
	})

	it("parses numeric strings", () => {
		configureFormatter({ locale: "en-US" })
		expect(formatPercent("0.75")).toBe("75.00%")
		expect(formatPercent("42")).toBe("42.00%")
	})

	it("returns non-numeric string as-is", () => {
		expect(formatPercent("N/A")).toBe("N/A")
	})

	it("returns fallback for empty non-numeric string", () => {
		expect(formatPercent("")).toBe("\u2014")
	})

	it("handles zero correctly", () => {
		configureFormatter({ locale: "en-US" })
		expect(formatPercent(0)).toBe("0.00%")
	})

	it("handles negative values", () => {
		configureFormatter({ locale: "en-US" })
		expect(formatPercent(-5)).toBe("-5.00%")
	})

	it("supports custom fallback", () => {
		expect(formatPercent(null, "N/A")).toBe("N/A")
	})
})
