import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"
import { configureFormatter, formatter } from "../global.js"

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

	it("static methods still work on Formatter class directly", () => {
		expect(Formatter.getMaskedValue("0901234567")).toBe("0901XXX567")
		expect(Formatter.gpsDistance(0, 0, 0, 0)).toBe(0)
	})
})
