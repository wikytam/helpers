import type { LocaleSpellout, NumberShortConfig } from "./types.js"

const ones = [
	"",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"twelve",
	"thirteen",
	"fourteen",
	"fifteen",
	"sixteen",
	"seventeen",
	"eighteen",
	"nineteen",
]

const tens = [
	"",
	"",
	"twenty",
	"thirty",
	"forty",
	"fifty",
	"sixty",
	"seventy",
	"eighty",
	"ninety",
]

const digitWords: Record<string, string> = {
	"0": "zero",
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine",
}

function convert(num: number): string {
	if (num === 0) return ""
	if (num < 20) return ones[num] ?? ""
	if (num < 100) {
		const t = tens[Math.floor(num / 10)] ?? ""
		const o = ones[num % 10]
		return o ? `${t}-${o}` : t
	}
	if (num < 1000) {
		const h = ones[Math.floor(num / 100)] ?? ""
		const remainder = num % 100
		return remainder ? `${h} hundred ${convert(remainder)}` : `${h} hundred`
	}
	if (num < 1_000_000) {
		const th = convert(Math.floor(num / 1000))
		const remainder = num % 1000
		return remainder ? `${th} thousand ${convert(remainder)}` : `${th} thousand`
	}
	if (num < 1_000_000_000) {
		const m = convert(Math.floor(num / 1_000_000))
		const remainder = num % 1_000_000
		return remainder ? `${m} million ${convert(remainder)}` : `${m} million`
	}
	const b = convert(Math.floor(num / 1_000_000_000))
	const remainder = num % 1_000_000_000
	return remainder ? `${b} billion ${convert(remainder)}` : `${b} billion`
}

export const enSpellout: LocaleSpellout = {
	zeroWord: "zero",
	pointWord: "point",
	negativePrefix: "minus",

	integerToWords(n: number): string {
		if (n === 0) return "zero"
		return convert(n).trim()
	},

	digitToWord(digit: string): string {
		return digitWords[digit] ?? digit
	},
}

export const enNumberShort: NumberShortConfig = {
	thresholds: [
		{ value: 1_000_000_000_000, suffix: " Trillion" },
		{ value: 1_000_000_000, suffix: " Billion" },
		{ value: 1_000_000, suffix: " Million" },
		{ value: 1_000, suffix: "K" },
	],
}
