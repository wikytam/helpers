import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

describe("Formatter - Ngày tháng & Thời gian", () => {
	const f = new Formatter({ locale: "en-US", timeZone: "UTC" })
	const testDate = new Date("2024-03-15T14:30:45.000Z")

	describe("asDate", () => {
		it("format ngày với preset medium mặc định", () => {
			const result = f.asDate(testDate)
			expect(result).toContain("Mar")
			expect(result).toContain("15")
			expect(result).toContain("2024")
		})

		it("format ngày với preset short", () => {
			const result = f.asDate(testDate, "short")
			expect(result).toMatch(/3\/15\/24/)
		})

		it("format ngày với preset long", () => {
			const result = f.asDate(testDate, "long")
			expect(result).toContain("March")
			expect(result).toContain("15")
			expect(result).toContain("2024")
		})

		it("format ngày với preset full", () => {
			const result = f.asDate(testDate, "full")
			expect(result).toContain("Friday")
			expect(result).toContain("March")
		})

		it("format ngày với Intl options custom", () => {
			const result = f.asDate(testDate, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			expect(result).toBe("03/15/2024")
		})

		it("auto-converts UNIX timestamp in seconds", () => {
			const result = f.asDate(1710513045)
			expect(result).toContain("2024")
			expect(result).toContain("Mar")
			expect(result).toContain("15")
		})

		it("auto-converts UNIX timestamp in milliseconds", () => {
			const result = f.asDate(1710513045000)
			expect(result).toContain("2024")
			expect(result).toContain("Mar")
			expect(result).toContain("15")
		})

		it("parses ISO string", () => {
			const result = f.asDate("2024-03-15")
			expect(result).toContain("2024")
		})

		it("null returns nullDisplay", () => {
			expect(f.asDate(null)).toBe("(not set)")
		})
	})

	describe("asTime", () => {
		it("format giờ với preset medium mặc định", () => {
			const result = f.asTime(testDate)
			expect(result).toContain("2:30:45")
		})

		it("format giờ với preset short", () => {
			const result = f.asTime(testDate, "short")
			expect(result).toContain("2:30")
		})
	})

	describe("asDatetime", () => {
		it("formats both date and time", () => {
			const result = f.asDatetime(testDate)
			expect(result).toContain("Mar")
			expect(result).toContain("2024")
			expect(result).toContain("2:30:45")
		})

		it("auto-converts UNIX timestamp in seconds", () => {
			const result = f.asDatetime(1710513045)
			expect(result).toContain("2024")
			expect(result).toContain("2:30:45")
		})

		it("auto-converts UNIX timestamp in milliseconds", () => {
			const result = f.asDatetime(1710513045000)
			expect(result).toContain("2024")
			expect(result).toContain("2:30:45")
		})
	})

	describe("asTimestamp", () => {
		it("trả về UNIX timestamp dạng chuỗi", () => {
			expect(f.asTimestamp(testDate)).toBe("1710513045")
		})

		it("chấp nhận ISO string", () => {
			const result = f.asTimestamp("2024-03-15T14:30:45.000Z")
			expect(result).toBe("1710513045")
		})
	})

	describe("asRelativeTime", () => {
		it("hiển thị 'ago' cho ngày trong quá khứ", () => {
			const past = new Date(Date.now() - 2 * 86400 * 1000)
			const result = f.asRelativeTime(past)
			expect(result).toContain("2 days ago")
		})

		it("hiển thị 'in' cho ngày trong tương lai", () => {
			const future = new Date(Date.now() + 3 * 3600 * 1000)
			const result = f.asRelativeTime(future)
			expect(result).toContain("in 3 hours")
		})

		it("hỗ trợ referenceTime tùy chỉnh", () => {
			const date = new Date("2024-03-15T14:30:00Z")
			const ref = new Date("2024-03-15T12:30:00Z")
			const result = f.asRelativeTime(date, ref)
			expect(result).toContain("2 hours")
		})

		it("hiển thị giây cho khoảng cách rất ngắn", () => {
			const date = new Date("2024-03-15T14:30:30Z")
			const ref = new Date("2024-03-15T14:30:00Z")
			const result = f.asRelativeTime(date, ref)
			expect(result).toContain("30 seconds")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asRelativeTime(null)).toBe("(not set)")
		})
	})

	describe("asDuration", () => {
		it("chuyển giây thành dạng đọc được", () => {
			const result = f.asDuration(5400)
			expect(result).toContain("1")
			expect(result).toContain("hour")
			expect(result).toContain("30")
			expect(result).toContain("minute")
		})

		it("xử lý nhiều đơn vị", () => {
			const result = f.asDuration(90061)
			expect(result).toContain("1")
			expect(result).toContain("day")
			expect(result).toContain("1")
			expect(result).toContain("hour")
			expect(result).toContain("1")
			expect(result).toContain("minute")
			expect(result).toContain("1")
			expect(result).toContain("second")
		})

		it("xử lý giá trị 0", () => {
			const result = f.asDuration(0)
			expect(result).toContain("0")
			expect(result).toContain("second")
		})

		it("xử lý số âm (lấy giá trị tuyệt đối)", () => {
			const result = f.asDuration(-3600)
			expect(result).toContain("1")
			expect(result).toContain("hour")
		})

		it("custom separator", () => {
			const result = f.asDuration(3661, " - ")
			expect(result).toContain(" - ")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asDuration(null)).toBe("(not set)")
		})
	})

	describe("TimeZone", () => {
		it("format theo timezone cấu hình", () => {
			const fTokyo = new Formatter({
				locale: "en-US",
				timeZone: "Asia/Tokyo",
			})
			const fUtc = new Formatter({ locale: "en-US", timeZone: "UTC" })

			const date = new Date("2024-03-15T14:30:00Z")
			const tokyoResult = fTokyo.asTime(date, "short")
			const utcResult = fUtc.asTime(date, "short")

			// Tokyo = UTC+9, nên giờ phải khác
			expect(tokyoResult).not.toBe(utcResult)
		})
	})

	describe("Locale cho ngày tháng", () => {
		it("format ngày theo locale tiếng Việt", () => {
			const fVi = new Formatter({ locale: "vi-VN", timeZone: "UTC" })
			const result = fVi.asDate(testDate, "long")
			// Kết quả chứa tháng tiếng Việt
			expect(result).toContain("2024")
		})

		it("format ngày theo locale tiếng Nhật", () => {
			const fJa = new Formatter({ locale: "ja-JP", timeZone: "UTC" })
			const result = fJa.asDate(testDate, "long")
			expect(result).toContain("2024")
		})
	})
})
