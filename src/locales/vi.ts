import type { LocaleSpellout, NumberShortConfig } from "./types.js"

const ones = [
	"",
	"m\u1ed9t",
	"hai",
	"ba",
	"b\u1ed1n",
	"n\u0103m",
	"s\u00e1u",
	"b\u1ea3y",
	"t\u00e1m",
	"ch\u00edn",
]

const onesInTens = [
	"",
	"m\u1ed1t",
	"hai",
	"ba",
	"b\u1ed1n",
	"l\u0103m", // 5 in tens position uses "lam" not "nam"
	"s\u00e1u",
	"b\u1ea3y",
	"t\u00e1m",
	"ch\u00edn",
]

const digitWords: Record<string, string> = {
	"0": "kh\u00f4ng",
	"1": "m\u1ed9t",
	"2": "hai",
	"3": "ba",
	"4": "b\u1ed1n",
	"5": "n\u0103m",
	"6": "s\u00e1u",
	"7": "b\u1ea3y",
	"8": "t\u00e1m",
	"9": "ch\u00edn",
}

/**
 * Vietnamese number spellout following standard rules:
 * - 5 in ones position of tens => "lam" (not "nam")
 * - 1 in ones position of tens (>=20) => "mot" with special handling
 * - 0 in ones position of tens => "muoi" only (no trailing)
 * - Tens starting with 1 => "muoi", otherwise => "muoi" with prefix
 */
function readTens(t: number, u: number): string {
	let result = ""

	if (t === 1) {
		result = "m\u01b0\u1eddi"
	} else {
		result = `${ones[t]} m\u01b0\u01a1i`
	}

	if (u === 0) return result
	if (u === 1 && t > 1) return `${result} m\u1ed1t`
	if (u === 5 && t > 0) return `${result} l\u0103m`
	return `${result} ${onesInTens[u] ?? ""}`
}

function readHundreds(h: number, t: number, u: number): string {
	const result = `${ones[h]} tr\u0103m`
	if (t === 0 && u === 0) return result
	if (t === 0) return `${result} linh ${ones[u]}`
	return `${result} ${readTens(t, u)}`
}

function readBlock(num: number): string {
	if (num === 0) return ""

	const h = Math.floor(num / 100)
	const t = Math.floor((num % 100) / 10)
	const u = num % 10

	if (h > 0) return readHundreds(h, t, u)
	if (t > 0) return readTens(t, u)
	return ones[u] ?? ""
}

function convert(num: number): string {
	if (num === 0) return "kh\u00f4ng"

	const units = [
		{ value: 1_000_000_000, label: "t\u1ef7" },
		{ value: 1_000_000, label: "tri\u1ec7u" },
		{ value: 1_000, label: "ngh\u00ecn" },
		{ value: 1, label: "" },
	]

	const parts: string[] = []
	let remaining = num

	for (const unit of units) {
		if (remaining >= unit.value) {
			const block = Math.floor(remaining / unit.value)
			remaining %= unit.value

			const blockStr = readBlock(block)
			if (blockStr) {
				parts.push(unit.label ? `${blockStr} ${unit.label}` : blockStr)
			}

			// Handle leading zeros in next block (e.g. 1001 -> "mot nghin khong tram linh mot")
			if (remaining > 0 && remaining < unit.value / 10) {
				// Needs "khong tram" prefix if next block < 100
				if (remaining < 100 && unit.value >= 1000) {
					parts.push("kh\u00f4ng tr\u0103m")
					if (remaining < 10) {
						parts.push(`linh ${ones[remaining]}`)
						remaining = 0
					}
				}
			}
		}
	}

	return parts.join(" ").trim()
}

export const viSpellout: LocaleSpellout = {
	zeroWord: "kh\u00f4ng",
	pointWord: "ph\u1ea9y",
	negativePrefix: "\u00e2m",

	integerToWords(n: number): string {
		if (n === 0) return "kh\u00f4ng"
		return convert(n)
	},

	digitToWord(digit: string): string {
		return digitWords[digit] ?? digit
	},
}

export const viNumberShort: NumberShortConfig = {
	thresholds: [
		{ value: 1_000_000_000_000, suffix: " Ngh\u00ecn T\u1ef7" },
		{ value: 1_000_000_000, suffix: " T\u1ef7" },
		{ value: 1_000_000, suffix: " Tri\u1ec7u" },
		{ value: 1_000, suffix: " Ng\u00e0n" },
	],
}
