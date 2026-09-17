import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

describe("Formatter - Dung lượng & Đo lường", () => {
	const f = new Formatter({ locale: "en-US" })

	describe("asSize (dạng dài)", () => {
		it("format bytes", () => {
			expect(f.asSize(100)).toBe("100 bytes")
		})

		it("format kilobytes", () => {
			const result = f.asSize(1536)
			expect(result).toBe("1.5 kilobytes")
		})

		it("format megabytes", () => {
			const result = f.asSize(1048576)
			expect(result).toBe("1 megabytes")
		})

		it("format gigabytes", () => {
			const result = f.asSize(1073741824)
			expect(result).toBe("1 gigabytes")
		})

		it("format terabytes", () => {
			const result = f.asSize(1099511627776)
			expect(result).toBe("1 terabytes")
		})

		it("format với decimals custom", () => {
			const result = f.asSize(1536, 3)
			expect(result).toBe("1.5 kilobytes")
		})

		it("format giá trị 0", () => {
			expect(f.asSize(0)).toBe("0 bytes")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asSize(null)).toBe("(not set)")
		})
	})

	describe("asShortSize (dạng ngắn)", () => {
		it("format bytes", () => {
			expect(f.asShortSize(100)).toBe("100 B")
		})

		it("format kilobytes", () => {
			expect(f.asShortSize(1536)).toBe("1.5 KB")
		})

		it("format megabytes", () => {
			expect(f.asShortSize(1048576)).toBe("1 MB")
		})

		it("format gigabytes", () => {
			expect(f.asShortSize(1073741824)).toBe("1 GB")
		})
	})

	describe("sizeFormatBase 1000", () => {
		const f1000 = new Formatter({
			locale: "en-US",
			sizeFormatBase: 1000,
		})

		it("1000 bytes = 1 KB", () => {
			expect(f1000.asShortSize(1000)).toBe("1 KB")
		})

		it("1000000 bytes = 1 MB", () => {
			expect(f1000.asShortSize(1000000)).toBe("1 MB")
		})

		it("1500 bytes = 1.5 KB", () => {
			expect(f1000.asShortSize(1500)).toBe("1.5 KB")
		})
	})

	describe("asLength (metric, dạng dài)", () => {
		it("format millimeters", () => {
			expect(f.asLength(500)).toBe("500 millimeters")
		})

		it("format meters", () => {
			expect(f.asLength(1500)).toBe("1.5 meters")
		})

		it("format kilometers", () => {
			expect(f.asLength(5000000)).toBe("5 kilometers")
		})

		it("null trả về nullDisplay", () => {
			expect(f.asLength(null)).toBe("(not set)")
		})
	})

	describe("asShortLength (metric, dạng ngắn)", () => {
		it("format mm", () => {
			expect(f.asShortLength(500)).toBe("500 mm")
		})

		it("format m", () => {
			expect(f.asShortLength(1500)).toBe("1.5 m")
		})

		it("format km", () => {
			expect(f.asShortLength(5000000)).toBe("5 km")
		})
	})

	describe("asLength (imperial)", () => {
		const fImp = new Formatter({
			locale: "en-US",
			systemOfUnits: "imperial",
		})

		it("format inches", () => {
			expect(fImp.asLength(6)).toBe("6 inches")
		})

		it("format feet", () => {
			expect(fImp.asLength(24)).toBe("2 feet")
		})

		it("format yards", () => {
			expect(fImp.asLength(72)).toBe("2 yards")
		})

		it("format miles", () => {
			expect(fImp.asLength(63360)).toBe("1 miles")
		})
	})

	describe("asWeight (metric, dạng dài)", () => {
		it("format grams", () => {
			expect(f.asWeight(500)).toBe("500 grams")
		})

		it("format kilograms", () => {
			expect(f.asWeight(1500)).toBe("1.5 kilograms")
		})

		it("format tons", () => {
			expect(f.asWeight(5000000)).toBe("5 tons")
		})
	})

	describe("asShortWeight (metric, dạng ngắn)", () => {
		it("format g", () => {
			expect(f.asShortWeight(500)).toBe("500 g")
		})

		it("format kg", () => {
			expect(f.asShortWeight(1500)).toBe("1.5 kg")
		})

		it("format t", () => {
			expect(f.asShortWeight(5000000)).toBe("5 t")
		})
	})

	describe("asWeight (imperial)", () => {
		const fImp = new Formatter({
			locale: "en-US",
			systemOfUnits: "imperial",
		})

		it("format grains", () => {
			expect(fImp.asWeight(100)).toBe("100 grains")
		})

		it("format ounces", () => {
			expect(fImp.asWeight(875)).toBe("2 ounces")
		})

		it("format pounds", () => {
			expect(fImp.asWeight(14000)).toBe("2 pounds")
		})
	})
})
