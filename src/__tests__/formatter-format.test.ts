import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

describe("Formatter - format() tổng quát", () => {
	const f = new Formatter({ locale: "en-US" })

	describe("gọi format method theo tên", () => {
		it("format('hello', 'text') gọi asText", () => {
			expect(f.format("<b>hello</b>", "text")).toBe("&lt;b&gt;hello&lt;/b&gt;")
		})

		it("format(123, 'integer') gọi asInteger", () => {
			expect(f.format(1234, "integer")).toBe("1,234")
		})

		it("format(true, 'boolean') gọi asBoolean", () => {
			expect(f.format(true, "boolean")).toBe("Yes")
		})

		it("format(date, 'date') gọi asDate", () => {
			const result = f.format("2024-03-15", "date")
			expect(result).toContain("2024")
		})
	})

	describe("hỗ trợ tuple [formatName, ...params]", () => {
		it("format(1234.5, ['decimal', 3]) truyền decimals=3", () => {
			expect(f.format(1234.5, ["decimal", 3])).toBe("1,234.500")
		})

		it("format(1234, ['currency', 'EUR']) truyền currency=EUR", () => {
			const result = f.format(1234, ["currency", "EUR"])
			expect(result).toContain("1,234")
		})
	})

	describe("null/undefined", () => {
		it("null trả về nullDisplay", () => {
			expect(f.format(null, "text")).toBe("(not set)")
		})

		it("undefined trả về nullDisplay", () => {
			expect(f.format(undefined, "integer")).toBe("(not set)")
		})
	})

	describe("format type không tồn tại", () => {
		it("throw Error cho format type không biết", () => {
			expect(() => f.format("test", "unknownFormat")).toThrow(
				"Unknown format type: unknownFormat",
			)
		})
	})
})

describe("Formatter - Utils", () => {
	describe("normalizeNumber", () => {
		const f = new Formatter()

		it("parse string có dấu phẩy", () => {
			expect(f.asInteger("1,234,567")).toBe("1,234,567")
		})

		it("xử lý boolean", () => {
			expect(f.asInteger(true)).toBe("1")
			expect(f.asInteger(false)).toBe("0")
		})

		it("throw cho giá trị không parse được", () => {
			expect(() => f.asInteger("abc")).toThrow()
		})
	})

	describe("normalizeDate", () => {
		const f = new Formatter({ timeZone: "UTC" })

		it("parse UNIX timestamp giây", () => {
			const result = f.asTimestamp(1710513045)
			expect(result).toBe("1710513045")
		})

		it("parse UNIX timestamp mili giây", () => {
			const result = f.asTimestamp(1710513045000)
			expect(result).toBe("1710513045")
		})

		it("throw cho string không phải date", () => {
			expect(() => f.asDate("not-a-date")).toThrow()
		})

		it("throw cho kiểu dữ liệu không hợp lệ", () => {
			expect(() => f.asDate({} as unknown)).toThrow()
		})
	})
})
