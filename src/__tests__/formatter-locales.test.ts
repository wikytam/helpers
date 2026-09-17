import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

describe("Formatter - Vietnamese spellout (asSpellout vi-VN)", () => {
	const f = new Formatter({ locale: "vi-VN" })

	it("spellout zero", () => {
		expect(f.asSpellout(0)).toBe("kh\u00f4ng")
	})

	it("spellout single digits", () => {
		expect(f.asSpellout(1)).toBe("m\u1ed9t")
		expect(f.asSpellout(5)).toBe("n\u0103m")
		expect(f.asSpellout(9)).toBe("ch\u00edn")
	})

	it("spellout tens", () => {
		expect(f.asSpellout(10)).toBe("m\u01b0\u1eddi")
		expect(f.asSpellout(15)).toBe("m\u01b0\u1eddi l\u0103m")
		expect(f.asSpellout(21)).toBe("hai m\u01b0\u01a1i m\u1ed1t")
		expect(f.asSpellout(25)).toBe("hai m\u01b0\u01a1i l\u0103m")
		expect(f.asSpellout(99)).toBe("ch\u00edn m\u01b0\u01a1i ch\u00edn")
	})

	it("spellout hundreds", () => {
		expect(f.asSpellout(100)).toBe("m\u1ed9t tr\u0103m")
		expect(f.asSpellout(105)).toBe("m\u1ed9t tr\u0103m linh n\u0103m")
		expect(f.asSpellout(115)).toBe("m\u1ed9t tr\u0103m m\u01b0\u1eddi l\u0103m")
		expect(f.asSpellout(999)).toBe(
			"ch\u00edn tr\u0103m ch\u00edn m\u01b0\u01a1i ch\u00edn",
		)
	})

	it("spellout thousands", () => {
		expect(f.asSpellout(1000)).toBe("m\u1ed9t ngh\u00ecn")
		expect(f.asSpellout(1500)).toBe("m\u1ed9t ngh\u00ecn n\u0103m tr\u0103m")
		expect(f.asSpellout(10000)).toBe("m\u01b0\u1eddi ngh\u00ecn")
	})

	it("spellout millions", () => {
		expect(f.asSpellout(1000000)).toBe("m\u1ed9t tri\u1ec7u")
		expect(f.asSpellout(2500000)).toBe(
			"hai tri\u1ec7u n\u0103m tr\u0103m ngh\u00ecn",
		)
	})

	it("spellout negative numbers", () => {
		const result = f.asSpellout(-5)
		expect(result).toBe("\u00e2m n\u0103m")
	})

	it("spellout decimal numbers", () => {
		const result = f.asSpellout(3.14)
		expect(result).toContain("ph\u1ea9y")
		expect(result).toContain("m\u1ed9t")
		expect(result).toContain("b\u1ed1n")
	})

	it("null returns nullDisplay", () => {
		expect(f.asSpellout(null)).toBe("(not set)")
	})
})

describe("Formatter - English spellout still works", () => {
	const f = new Formatter({ locale: "en-US" })

	it("spellout basic numbers", () => {
		expect(f.asSpellout(0)).toBe("zero")
		expect(f.asSpellout(1)).toBe("one")
		expect(f.asSpellout(42)).toBe("forty-two")
		expect(f.asSpellout(100)).toBe("one hundred")
		expect(f.asSpellout(1000000)).toBe("one million")
	})

	it("spellout large numbers", () => {
		expect(f.asSpellout(1234567)).toBe(
			"one million two hundred thirty-four thousand five hundred sixty-seven",
		)
	})

	it("spellout negative", () => {
		expect(f.asSpellout(-5)).toBe("minus five")
	})

	it("spellout decimal", () => {
		expect(f.asSpellout(3.14)).toBe("three point one four")
	})
})
