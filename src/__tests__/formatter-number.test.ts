import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

describe("Formatter - Số & Tiền tệ", () => {
	const f = new Formatter({ locale: "en-US" })

	describe("asInteger", () => {
		it("format số nguyên với dấu phân cách hàng nghìn", () => {
			expect(f.asInteger(1234567)).toBe("1,234,567")
		})

		it("loại bỏ phần thập phân không làm tròn", () => {
			expect(f.asInteger(1234.99)).toBe("1,234")
		})

		it("xử lý số âm", () => {
			expect(f.asInteger(-5678)).toBe("-5,678")
		})

		it("parse string thành số", () => {
			expect(f.asInteger("42000")).toBe("42,000")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asInteger(null)).toBe("(not set)")
		})
	})

	describe("asDecimal", () => {
		it("format số thập phân mặc định 2 chữ số", () => {
			expect(f.asDecimal(1234.5)).toBe("1,234.50")
		})

		it("format với số chữ số thập phân custom", () => {
			expect(f.asDecimal(1234.5678, 3)).toBe("1,234.568")
		})

		it("format với 0 chữ số thập phân", () => {
			expect(f.asDecimal(1234.5, 0)).toBe("1,235")
		})

		it("xử lý số âm", () => {
			expect(f.asDecimal(-1234.56)).toBe("-1,234.56")
		})
	})

	describe("asPercent", () => {
		it("format phần trăm (0.15 → 15%)", () => {
			expect(f.asPercent(0.15)).toBe("15%")
		})

		it("format với chữ số thập phân", () => {
			expect(f.asPercent(0.1567, 2)).toBe("15.67%")
		})

		it("xử lý giá trị > 1", () => {
			expect(f.asPercent(1.5)).toBe("150%")
		})

		it("giá trị 0", () => {
			expect(f.asPercent(0)).toBe("0%")
		})
	})

	describe("asCurrency", () => {
		it("format tiền USD mặc định", () => {
			const result = f.asCurrency(1234.56)
			expect(result).toBe("$1,234.56")
		})

		it("format tiền EUR", () => {
			const result = f.asCurrency(1234.56, "EUR")
			// Intl format EUR hơi khác nhau tùy locale, chỉ kiểm tra có chứa giá trị
			expect(result).toContain("1,234.56")
		})

		it("format tiền VND", () => {
			const fVi = new Formatter({ locale: "vi-VN", currencyCode: "VND" })
			const result = fVi.asCurrency(1234567)
			// Kiểm tra có format số đúng
			expect(result).toContain("1.234.567")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asCurrency(null)).toBe("(not set)")
		})
	})

	describe("asScientific", () => {
		it("format dạng khoa học", () => {
			const result = f.asScientific(1234567)
			// Intl format: "1.23E6" hoặc "1.23×10^6" tùy locale
			expect(result).toMatch(/1[.,]23.*6/)
		})

		it("format với số chữ số thập phân custom", () => {
			const result = f.asScientific(1234567, 4)
			expect(result).toMatch(/1[.,]2346.*6/)
		})
	})

	describe("asSpellout", () => {
		it("chuyển số thành chữ tiếng Anh", () => {
			expect(f.asSpellout(0)).toBe("zero")
			expect(f.asSpellout(1)).toBe("one")
			expect(f.asSpellout(21)).toBe("twenty-one")
			expect(f.asSpellout(100)).toBe("one hundred")
			expect(f.asSpellout(1001)).toBe("one thousand one")
		})

		it("xử lý số lớn", () => {
			expect(f.asSpellout(1000000)).toBe("one million")
			expect(f.asSpellout(1234567)).toBe(
				"one million two hundred thirty-four thousand five hundred sixty-seven",
			)
		})

		it("xử lý số âm", () => {
			expect(f.asSpellout(-5)).toBe("minus five")
		})

		it("xử lý số thập phân", () => {
			const result = f.asSpellout(3.14)
			expect(result).toBe("three point one four")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asSpellout(null)).toBe("(not set)")
		})
	})

	describe("asOrdinal", () => {
		it("format ordinal tiếng Anh", () => {
			expect(f.asOrdinal(1)).toBe("1st")
			expect(f.asOrdinal(2)).toBe("2nd")
			expect(f.asOrdinal(3)).toBe("3rd")
			expect(f.asOrdinal(4)).toBe("4th")
			expect(f.asOrdinal(11)).toBe("11th")
			expect(f.asOrdinal(12)).toBe("12th")
			expect(f.asOrdinal(13)).toBe("13th")
			expect(f.asOrdinal(21)).toBe("21st")
			expect(f.asOrdinal(22)).toBe("22nd")
			expect(f.asOrdinal(23)).toBe("23rd")
			expect(f.asOrdinal(100)).toBe("100th")
			expect(f.asOrdinal(101)).toBe("101st")
		})
	})

	describe("Custom separators", () => {
		it("custom dấu phân cách thập phân và hàng nghìn", () => {
			const fCustom = new Formatter({
				locale: "en-US",
				decimalSeparator: ",",
				thousandSeparator: ".",
			})
			expect(fCustom.asDecimal(1234567.89)).toBe("1.234.567,89")
		})

		it("custom separator cho tiền tệ", () => {
			const fCustom = new Formatter({
				locale: "en-US",
				currencyDecimalSeparator: ",",
				thousandSeparator: ".",
			})
			const result = fCustom.asCurrency(1234.56)
			expect(result).toBe("$1.234,56")
		})
	})

	describe("defaultDecimalDigits", () => {
		it("sử dụng defaultDecimalDigits khi không truyền decimals", () => {
			const fCustom = new Formatter({
				locale: "en-US",
				defaultDecimalDigits: 4,
			})
			expect(fCustom.asDecimal(1.5)).toBe("1.5000")
		})
	})
})
