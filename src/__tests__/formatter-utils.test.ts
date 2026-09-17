import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

// ─── asNumberShort() ──────────────────────────────────────────────

describe("Formatter - asNumberShort()", () => {
	describe("English locale", () => {
		const f = new Formatter({ locale: "en-US", currencyCode: "USD" })

		it("abbreviates trillions", () => {
			const result = f.asNumberShort(1_500_000_000_000)
			expect(result).toContain("1.5")
			expect(result).toContain("Trillion")
		})

		it("abbreviates billions", () => {
			const result = f.asNumberShort(2_300_000_000)
			expect(result).toContain("2.3")
			expect(result).toContain("Billion")
		})

		it("abbreviates millions", () => {
			const result = f.asNumberShort(5_600_000)
			expect(result).toContain("5.6")
			expect(result).toContain("Million")
		})

		it("abbreviates thousands", () => {
			const result = f.asNumberShort(42_000)
			expect(result).toContain("42.0")
			expect(result).toContain("K")
		})

		it("falls back to currency for small numbers (default)", () => {
			const result = f.asNumberShort(999)
			expect(result).toBe("$999.00")
		})

		it("null returns nullDisplay", () => {
			expect(f.asNumberShort(null)).toBe("(not set)")
		})

		it("custom decimals option", () => {
			const result = f.asNumberShort(1_234_567, { decimals: 2 })
			expect(result).toContain("1.23")
			expect(result).toContain("Million")
		})

		it("fallback: decimal", () => {
			const result = f.asNumberShort(500, { fallback: "decimal" })
			expect(result).toBe("500.0")
		})

		it("fallback: integer", () => {
			const result = f.asNumberShort(500, { fallback: "integer" })
			expect(result).toBe("500")
		})

		it("spaceBefore adds space when suffix has no leading space (K)", () => {
			const result = f.asNumberShort(42_000, { spaceBefore: true })
			expect(result).toContain("42.0 K")
		})

		it("spaceBefore does not double-space when suffix already has space", () => {
			const result = f.asNumberShort(5_000_000, { spaceBefore: true })
			expect(result).toContain("5.0 Million")
			expect(result).not.toContain("5.0  Million")
		})
	})

	describe("Vietnamese locale", () => {
		const f = new Formatter({ locale: "vi-VN", currencyCode: "VND" })

		it("abbreviates with Vietnamese suffixes", () => {
			const result = f.asNumberShort(1_500_000_000_000)
			expect(result).toContain("1,5")
			expect(result).toContain("Ngh\u00ecn T\u1ef7")
		})

		it("abbreviates billions (Ty)", () => {
			const result = f.asNumberShort(2_000_000_000)
			expect(result).toContain("2")
			expect(result).toContain("T\u1ef7")
		})

		it("abbreviates millions (Trieu)", () => {
			const result = f.asNumberShort(5_000_000)
			expect(result).toContain("5")
			expect(result).toContain("Tri\u1ec7u")
		})

		it("abbreviates thousands (Ngan)", () => {
			const result = f.asNumberShort(42_000)
			expect(result).toContain("42")
			expect(result).toContain("Ng\u00e0n")
		})
	})
})

// ─── asGpsDistance() ──────────────────────────────────────────────

describe("Formatter - asGpsDistance()", () => {
	const f = new Formatter({ locale: "en-US" })

	it("auto: returns km for large distances", () => {
		// New York -> Los Angeles (~3944 km)
		const result = f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437)
		expect(result).toMatch(/[\d,]+\.\d+\s*km/)
	})

	it("auto: returns m for short distances", () => {
		// Two points ~100m apart
		const result = f.asGpsDistance(10, 20, 10.0009, 20)
		expect(result).toContain("m")
		expect(result).not.toContain("km")
	})

	it("unit: km forced", () => {
		const result = f.asGpsDistance(10, 20, 10.0009, 20, { unit: "km" })
		expect(result).toContain("km")
	})

	it("unit: m forced", () => {
		const result = f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437, {
			unit: "m",
		})
		expect(result).toContain("m")
		expect(result).not.toContain("km")
	})

	it("unit: mi (miles)", () => {
		const result = f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437, {
			unit: "mi",
		})
		expect(result).toContain("mi")
	})

	it("custom decimals", () => {
		const result = f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437, {
			decimals: 3,
		})
		// Should have 3 decimal places
		expect(result).toMatch(/\.\d{3}/)
	})

	it("returns 0 for same point", () => {
		const result = f.asGpsDistance(10, 20, 10, 20)
		expect(result).toContain("0")
		expect(result).toContain("m")
	})

	it("uses locale formatting", () => {
		const fVi = new Formatter({ locale: "vi-VN" })
		const result = fVi.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437)
		// Vietnamese uses comma as decimal separator
		expect(result).toContain(",")
		expect(result).toContain("km")
	})
})

// ─── asMaskedValue() ─────────────────────────────────────────────

describe("Formatter - asMaskedValue()", () => {
	const f = new Formatter()

	it("masks middle of a string with defaults", () => {
		expect(f.asMaskedValue("0901234567")).toBe("0901XXX567")
	})

	it("custom startVisible and endVisible", () => {
		expect(
			f.asMaskedValue("0901234567", { startVisible: 2, endVisible: 2 }),
		).toBe("09XXXXXX67")
	})

	it("custom mask character", () => {
		expect(f.asMaskedValue("0901234567", { maskChar: "*" })).toBe("0901***567")
	})

	it("returns full value if too short to mask", () => {
		expect(f.asMaskedValue("abc", { startVisible: 4, endVisible: 3 })).toBe(
			"abc",
		)
	})

	it("returns nullDisplay for null", () => {
		expect(f.asMaskedValue(null)).toBe("(not set)")
	})

	it("returns nullDisplay for undefined", () => {
		expect(f.asMaskedValue(undefined)).toBe("(not set)")
	})

	it("masks numbers (auto-converts to string)", () => {
		expect(f.asMaskedValue(1234567890)).toBe("1234XXX890")
	})

	it("masks email", () => {
		expect(
			f.asMaskedValue("user@example.com", { startVisible: 3, endVisible: 4 }),
		).toBe("useXXXXXXXXX.com")
	})

	it("masks credit card", () => {
		expect(
			f.asMaskedValue("4111111111111111", {
				startVisible: 4,
				endVisible: 4,
			}),
		).toBe("4111XXXXXXXX1111")
	})

	it("combines with custom nullDisplay", () => {
		const fCustom = new Formatter({ nullDisplay: "N/A" })
		expect(fCustom.asMaskedValue(null)).toBe("N/A")
	})
})
