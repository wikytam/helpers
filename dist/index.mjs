// src/locales/en.ts
const ones$1 = [
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
	"nineteen"
];
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
	"ninety"
];
const digitWords$1 = {
	"0": "zero",
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine"
};
function convert$1(num) {
	if (num === 0) return "";
	if (num < 20) return ones$1[num] ?? "";
	if (num < 100) {
		const t = tens[Math.floor(num / 10)] ?? "";
		const o = ones$1[num % 10];
		return o ? `${t}-${o}` : t;
	}
	if (num < 1e3) {
		const h = ones$1[Math.floor(num / 100)] ?? "";
		const remainder = num % 100;
		return remainder ? `${h} hundred ${convert$1(remainder)}` : `${h} hundred`;
	}
	if (num < 1e6) {
		const th = convert$1(Math.floor(num / 1e3));
		const remainder = num % 1e3;
		return remainder ? `${th} thousand ${convert$1(remainder)}` : `${th} thousand`;
	}
	if (num < 1e9) {
		const m = convert$1(Math.floor(num / 1e6));
		const remainder = num % 1e6;
		return remainder ? `${m} million ${convert$1(remainder)}` : `${m} million`;
	}
	const b = convert$1(Math.floor(num / 1e9));
	const remainder = num % 1e9;
	return remainder ? `${b} billion ${convert$1(remainder)}` : `${b} billion`;
}
const enSpellout = {
	zeroWord: "zero",
	pointWord: "point",
	negativePrefix: "minus",
	integerToWords(n) {
		if (n === 0) return "zero";
		return convert$1(n).trim();
	},
	digitToWord(digit) {
		return digitWords$1[digit] ?? digit;
	}
};
const enNumberShort = { thresholds: [
	{
		value: 0xe8d4a51000,
		suffix: " Trillion"
	},
	{
		value: 1e9,
		suffix: " Billion"
	},
	{
		value: 1e6,
		suffix: " Million"
	},
	{
		value: 1e3,
		suffix: "K"
	}
] };
// src/locales/vi.ts
const ones = [
	"",
	"một",
	"hai",
	"ba",
	"bốn",
	"năm",
	"sáu",
	"bảy",
	"tám",
	"chín"
];
const onesInTens = [
	"",
	"mốt",
	"hai",
	"ba",
	"bốn",
	"lăm",
	"sáu",
	"bảy",
	"tám",
	"chín"
];
const digitWords = {
	"0": "không",
	"1": "một",
	"2": "hai",
	"3": "ba",
	"4": "bốn",
	"5": "năm",
	"6": "sáu",
	"7": "bảy",
	"8": "tám",
	"9": "chín"
};
/**
* Vietnamese number spellout following standard rules:
* - 5 in ones position of tens => "lam" (not "nam")
* - 1 in ones position of tens (>=20) => "mot" with special handling
* - 0 in ones position of tens => "muoi" only (no trailing)
* - Tens starting with 1 => "muoi", otherwise => "muoi" with prefix
*/
function readTens(t, u) {
	let result = "";
	if (t === 1) result = "mười";
	else result = `${ones[t]} m\u01b0\u01a1i`;
	if (u === 0) return result;
	if (u === 1 && t > 1) return `${result} m\u1ed1t`;
	if (u === 5 && t > 0) return `${result} l\u0103m`;
	return `${result} ${onesInTens[u] ?? ""}`;
}
function readHundreds(h, t, u) {
	const result = `${ones[h]} tr\u0103m`;
	if (t === 0 && u === 0) return result;
	if (t === 0) return `${result} linh ${ones[u]}`;
	return `${result} ${readTens(t, u)}`;
}
function readBlock(num) {
	if (num === 0) return "";
	const h = Math.floor(num / 100);
	const t = Math.floor(num % 100 / 10);
	const u = num % 10;
	if (h > 0) return readHundreds(h, t, u);
	if (t > 0) return readTens(t, u);
	return ones[u] ?? "";
}
function convert(num) {
	if (num === 0) return "không";
	const units = [
		{
			value: 1e9,
			label: "tỷ"
		},
		{
			value: 1e6,
			label: "triệu"
		},
		{
			value: 1e3,
			label: "nghìn"
		},
		{
			value: 1,
			label: ""
		}
	];
	const parts = [];
	let remaining = num;
	for (const unit of units) if (remaining >= unit.value) {
		const block = Math.floor(remaining / unit.value);
		remaining %= unit.value;
		const blockStr = readBlock(block);
		if (blockStr) parts.push(unit.label ? `${blockStr} ${unit.label}` : blockStr);
		if (remaining > 0 && remaining < unit.value / 10) {
			if (remaining < 100 && unit.value >= 1e3) {
				parts.push("không trăm");
				if (remaining < 10) {
					parts.push(`linh ${ones[remaining]}`);
					remaining = 0;
				}
			}
		}
	}
	return parts.join(" ").trim();
}
const viSpellout = {
	zeroWord: "không",
	pointWord: "phẩy",
	negativePrefix: "âm",
	integerToWords(n) {
		if (n === 0) return "không";
		return convert(n);
	},
	digitToWord(digit) {
		return digitWords[digit] ?? digit;
	}
};
const viNumberShort = { thresholds: [
	{
		value: 0xe8d4a51000,
		suffix: " Nghìn Tỷ"
	},
	{
		value: 1e9,
		suffix: " Tỷ"
	},
	{
		value: 1e6,
		suffix: " Triệu"
	},
	{
		value: 1e3,
		suffix: " Ngàn"
	}
] };
// src/locales/index.ts
/** Built-in spellout locale registry. */
const spelloutRegistry = {
	en: enSpellout,
	vi: viSpellout
};
/** Built-in number-short locale registry. */
const numberShortRegistry = {
	en: enNumberShort,
	vi: viNumberShort
};
/** Get the spellout provider for a locale, falling back to English. */
function getSpellout(locale) {
	const lang = locale.split("-")[0];
	return spelloutRegistry[lang] ?? enSpellout;
}
/** Get the number-short config for a locale, falling back to English. */
function getNumberShortConfig(locale) {
	const lang = locale.split("-")[0];
	return numberShortRegistry[lang] ?? enNumberShort;
}
/** Register a custom spellout locale at runtime. */
function registerSpellout(lang, impl) {
	spelloutRegistry[lang] = impl;
}
/** Register a custom number-short config at runtime. */
function registerNumberShort(lang, config) {
	numberShortRegistry[lang] = config;
}
// src/utils.ts
/**
* Escape the 5 HTML-special characters, equivalent to PHP's htmlspecialchars().
* No external dependency - pure string replacement.
*/
function escapeHtml(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
/**
* Parse a "GMT+7" / "GMT-5:30" / "GMT" style string from Intl into a
* standard offset like "+07:00" / "-05:30" / "+00:00".
*/
function parseGMTOffset(gmtStr) {
	if (gmtStr === "GMT" || gmtStr === "UTC") return "+00:00";
	const match = gmtStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
	if (!match) return "+00:00";
	return `${match[1]}${(match[2] ?? "0").padStart(2, "0")}:${(match[3] ?? "0").padStart(2, "0")}`;
}
/**
* Get the UTC offset string (e.g. "+07:00") for an IANA timezone name
* at the given reference date, using only built-in Intl APIs.
*/
function getIANAOffset(iana, refDate) {
	return parseGMTOffset(new Intl.DateTimeFormat("en-US", {
		timeZone: iana,
		timeZoneName: "shortOffset"
	}).formatToParts(refDate).find((p) => p.type === "timeZoneName")?.value ?? "GMT");
}
/**
* Normalize an input value into a Date object.
* Accepts: Date, number (UNIX seconds or milliseconds), string (ISO 8601).
*
* When `defaultTimeZone` is provided and differs from "UTC", ISO strings
* ending with "Z" are reinterpreted as being in that timezone instead of UTC.
* This handles the common case where backends (Drizzle, Prisma, etc.) append
* "Z" to timestamps that are actually stored in local time.
*/
function normalizeDate(value, defaultTimeZone) {
	if (value instanceof Date) return value;
	if (typeof value === "number") return new Date(value < 0xe8d4a51000 ? value * 1e3 : value);
	if (typeof value === "string") {
		let str = value;
		if (defaultTimeZone && defaultTimeZone !== "UTC" && str.includes("T") && str.endsWith("Z")) {
			const offset = getIANAOffset(defaultTimeZone, new Date(str));
			str = str.slice(0, -1) + offset;
		}
		const parsed = new Date(str);
		if (Number.isNaN(parsed.getTime())) throw new Error(`Cannot parse date value: "${value}"`);
		return parsed;
	}
	throw new Error(`Invalid data type for date: ${typeof value}`);
}
/**
* Parse a date string safely for display, with optional timezone reinterpretation.
*
* - Strings like "2024-03-15T14:30:00" (no Z, no +offset) get "Z" appended
*   to ensure consistent UTC interpretation across environments.
* - When `defaultTimeZone` is set and differs from "UTC", Z-suffix strings
*   are reinterpreted as being in that timezone (same logic as normalizeDate).
* - Returns an Invalid Date (NaN) for null, undefined, or empty values
*   instead of throwing - suitable for display pipelines.
*/
function parseDate(date, defaultTimeZone) {
	if (!date) return /* @__PURE__ */ new Date(NaN);
	if (date instanceof Date) return date;
	let str = date;
	if (defaultTimeZone && defaultTimeZone !== "UTC" && str.includes("T") && str.endsWith("Z")) {
		const offset = getIANAOffset(defaultTimeZone, new Date(str));
		str = str.slice(0, -1) + offset;
	} else if (!str.endsWith("Z") && !str.includes("+") && str.includes("T")) str += "Z";
	return new Date(str);
}
/**
* Normalize an input value into a number.
* Accepts: number, numeric string (with optional comma grouping), boolean.
*/
function normalizeNumber(value) {
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const cleaned = value.trim().replace(/,/g, "");
		const num = Number(cleaned);
		if (Number.isNaN(num)) throw new Error(`Cannot parse numeric value: "${value}"`);
		return num;
	}
	if (typeof value === "boolean") return value ? 1 : 0;
	throw new Error(`Invalid data type for number: ${typeof value}`);
}
/**
* Convert a preset name (short/medium/long/full) to Intl.DateTimeFormatOptions.
*/
function presetToDateOptions(preset, type) {
	const dateOptions = {
		short: {
			year: "2-digit",
			month: "numeric",
			day: "numeric"
		},
		medium: {
			year: "numeric",
			month: "short",
			day: "numeric"
		},
		long: {
			year: "numeric",
			month: "long",
			day: "numeric"
		},
		full: {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long"
		}
	};
	const timeOptions = {
		short: {
			hour: "numeric",
			minute: "numeric"
		},
		medium: {
			hour: "numeric",
			minute: "numeric",
			second: "numeric"
		},
		long: {
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			timeZoneName: "short"
		},
		full: {
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			timeZoneName: "long"
		}
	};
	switch (type) {
		case "date": return dateOptions[preset] ?? dateOptions.medium;
		case "time": return timeOptions[preset] ?? timeOptions.medium;
		case "datetime": return {
			...dateOptions[preset] ?? dateOptions.medium,
			...timeOptions[preset] ?? timeOptions.medium
		};
	}
}
/**
* Resolve a format value: string preset -> Intl options, object -> use directly.
*/
function resolveDateFormat(format, defaultPreset, type) {
	if (!format) return presetToDateOptions(defaultPreset, type);
	if (typeof format === "object") return format;
	return presetToDateOptions(format, type);
}
/**
* Replace locale-default separators with custom ones in a formatted string.
* Uses temporary placeholders to avoid replacement collisions.
*/
function applyCustomSeparators(formatted, locale, customDecimal, customThousand) {
	if (customDecimal == null && customThousand == null) return formatted;
	const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
	const localeDecimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
	const localeGroup = parts.find((p) => p.type === "group")?.value ?? ",";
	let result = formatted;
	const PLACEHOLDER_DEC = "";
	const PLACEHOLDER_GRP = "";
	if (customDecimal != null) result = result.replaceAll(localeDecimal, PLACEHOLDER_DEC);
	if (customThousand != null) result = result.replaceAll(localeGroup, PLACEHOLDER_GRP);
	if (customDecimal != null) result = result.replaceAll(PLACEHOLDER_DEC, customDecimal);
	if (customThousand != null) result = result.replaceAll(PLACEHOLDER_GRP, customThousand);
	return result;
}
// src/formatter.ts
/** Returns true for null or undefined only. */
function isNullish(value) {
	return value === null || value === void 0;
}
/** Returns true for null, undefined, or empty/whitespace-only strings. */
function isBlank(value) {
	if (value === null || value === void 0) return true;
	if (typeof value === "string" && value.trim() === "") return true;
	return false;
}
/**
* TypeScript port of yii\i18n\Formatter.
*
* Uses only built-in Intl APIs - zero external dependencies.
* Supports: strings, HTML, numbers, currency, dates, times,
* file sizes, measurement units, and more.
*/
var Formatter = class Formatter {
	locale;
	timeZone;
	defaultTimeZone;
	dateFormat;
	timeFormat;
	datetimeFormat;
	booleanFormat;
	nullDisplay;
	currencyCode;
	decimalSeparator;
	thousandSeparator;
	currencyDecimalSeparator;
	sizeFormatBase;
	systemOfUnits;
	defaultDecimalDigits;
	constructor(options = {}) {
		this.locale = options.locale ?? "en-US";
		this.timeZone = options.timeZone ?? "UTC";
		this.defaultTimeZone = options.defaultTimeZone ?? "UTC";
		this.dateFormat = options.dateFormat ?? "medium";
		this.timeFormat = options.timeFormat ?? "medium";
		this.datetimeFormat = options.datetimeFormat ?? "medium";
		this.booleanFormat = options.booleanFormat ?? ["No", "Yes"];
		this.nullDisplay = options.nullDisplay ?? "(not set)";
		this.currencyCode = options.currencyCode ?? "USD";
		this.decimalSeparator = options.decimalSeparator ?? null;
		this.thousandSeparator = options.thousandSeparator ?? null;
		this.currencyDecimalSeparator = options.currencyDecimalSeparator ?? null;
		this.sizeFormatBase = options.sizeFormatBase ?? 1024;
		this.systemOfUnits = options.systemOfUnits ?? "metric";
		this.defaultDecimalDigits = options.defaultDecimalDigits ?? null;
	}
	/**
	* Format a value by type name, like Yii2's `$formatter->format($value, 'date')`.
	* Supports both string and tuple `[formatName, ...params]` signatures.
	*/
	format(value, type) {
		if (isNullish(value)) return this.nullDisplay;
		const formatName = Array.isArray(type) ? type[0] : type;
		const params = Array.isArray(type) ? type.slice(1) : [];
		const methodName = `as${formatName.charAt(0).toUpperCase()}${formatName.slice(1)}`;
		const method = this[methodName];
		if (typeof method === "function") return method.call(this, value, ...params);
		throw new Error(`Unknown format type: ${formatName}`);
	}
	/** Returns the value as-is without any formatting. */
	asRaw(value) {
		if (isNullish(value)) return this.nullDisplay;
		return String(value);
	}
	/** Formats the value as HTML-encoded plain text. */
	asText(value) {
		if (isNullish(value)) return this.nullDisplay;
		return escapeHtml(String(value));
	}
	/**
	* Formats the value as HTML-encoded text with newlines converted to `<br />`.
	* Handles all line-ending variants: `\r\n` (Windows), `\r` (old Mac), `\n` (Unix).
	* Consecutive newlines produce multiple `<br />` tags.
	*/
	asNtext(value) {
		if (isNullish(value)) return this.nullDisplay;
		return escapeHtml(String(value)).replace(/\r\n/g, "<br />").replace(/[\r\n]/g, "<br />");
	}
	/**
	* Formats the value as HTML-encoded text paragraphs (split by double newlines).
	* Supports configurable wrapper tag and inline line-break conversion.
	*/
	asParagraphs(value, options) {
		if (isNullish(value)) return this.nullDisplay;
		const tag = options?.tag ?? "p";
		const lineBreaks = options?.lineBreaks ?? false;
		return String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(/\n\s*\n/).map((p) => {
			let content = escapeHtml(p.trim());
			if (lineBreaks) content = content.replace(/\n/g, "<br />");
			return `<${tag}>${content}</${tag}>`;
		}).filter((p) => p !== `<${tag}></${tag}>`).join("\n");
	}
	/**
	* Returns the value as HTML text.
	* When a sanitize config is provided, only allowed tags and attributes are kept.
	* Without config, the value is returned as-is (caller is responsible for safety).
	*/
	asHtml(value, sanitize) {
		if (isNullish(value)) return this.nullDisplay;
		const html = String(value);
		if (!sanitize) return html;
		return Formatter.sanitizeHtml(html, sanitize);
	}
	/**
	* Allowlist-based HTML sanitizer. Strips tags and attributes not in the config.
	* Handles self-closing tags, nested tags, and attribute filtering.
	*/
	static sanitizeHtml(html, config) {
		const allowedTags = new Set((config.allowedTags ?? []).map((t) => t.toLowerCase()));
		const allowedAttrs = config.allowedAttributes ?? {};
		return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\s*\/?>/g, (match, tagName, attrsStr) => {
			const tag = tagName.toLowerCase();
			if (!allowedTags.has(tag)) return "";
			if (match.startsWith("</")) return `</${tag}>`;
			const isSelfClosing = match.endsWith("/>");
			const tagAllowedAttrs = new Set((allowedAttrs[tag] ?? []).map((a) => a.toLowerCase()));
			const filteredAttrs = [];
			const attrRegex = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
			let attrMatch = null;
			while (true) {
				attrMatch = attrRegex.exec(attrsStr);
				if (!attrMatch) break;
				const attrName = attrMatch[1].toLowerCase();
				if (tagAllowedAttrs.has(attrName)) {
					const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4];
					if (attrValue !== void 0) filteredAttrs.push(`${attrName}="${escapeHtml(attrValue)}"`);
					else filteredAttrs.push(attrName);
				}
			}
			const attrsOut = filteredAttrs.length > 0 ? ` ${filteredAttrs.join(" ")}` : "";
			return isSelfClosing ? `<${tag}${attrsOut} />` : `<${tag}${attrsOut}>`;
		});
	}
	/**
	* Formats the value as a mailto link.
	* Supports custom display text, subject, and body parameters.
	* Validates email format - returns escaped plain text for invalid emails.
	*/
	asEmail(value, options) {
		if (isBlank(value)) return this.nullDisplay;
		const email = String(value);
		if (!Formatter.isValidEmail(email)) return escapeHtml(email);
		const params = [];
		if (options?.subject) params.push(`subject=${encodeURIComponent(options.subject)}`);
		if (options?.body) params.push(`body=${encodeURIComponent(options.body)}`);
		const query = params.length > 0 ? `?${params.join("&")}` : "";
		const displayText = escapeHtml(options?.text ?? email);
		return `<a href="mailto:${escapeHtml(email)}${query}">${displayText}</a>`;
	}
	/** Basic email format validation (covers most common patterns). */
	static isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
	/**
	* Formats the value as a hyperlink.
	* Detects http, https, ftp, ftps, and mailto schemes.
	* Prepends `http://` when no recognized scheme is present.
	*/
	asUrl(value, options) {
		if (isBlank(value)) return this.nullDisplay;
		const url = String(value);
		const href = /^(https?|ftps?|mailto):/i.test(url) ? url : `http://${url}`;
		const target = options?.target ?? "_blank";
		const displayText = escapeHtml(options?.text ?? url);
		const attrs = [`href="${escapeHtml(href)}"`, `target="${escapeHtml(target)}"`];
		if (options?.rel) attrs.push(`rel="${escapeHtml(options.rel)}"`);
		if (options?.class) attrs.push(`class="${escapeHtml(options.class)}"`);
		return `<a ${attrs.join(" ")}>${displayText}</a>`;
	}
	/**
	* Formats the value as an image tag.
	* Supports width, height, CSS class, and loading strategy attributes.
	*/
	asImage(value, options) {
		if (isBlank(value)) return this.nullDisplay;
		const src = String(value);
		const alt = options?.alt ?? "";
		const attrs = [`src="${escapeHtml(src)}"`, `alt="${escapeHtml(alt)}"`];
		if (options?.width != null) attrs.push(`width="${escapeHtml(String(options.width))}"`);
		if (options?.height != null) attrs.push(`height="${escapeHtml(String(options.height))}"`);
		if (options?.class) attrs.push(`class="${escapeHtml(options.class)}"`);
		if (options?.loading) attrs.push(`loading="${escapeHtml(options.loading)}"`);
		return `<img ${attrs.join(" ")} />`;
	}
	/** Formats the value as a boolean using the configured booleanFormat labels. */
	asBoolean(value) {
		if (isNullish(value)) return this.nullDisplay;
		return value ? this.booleanFormat[1] : this.booleanFormat[0];
	}
	/** Formats the value as an integer by removing decimal digits without rounding. */
	asInteger(value) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const intVal = Math.trunc(num);
		return applyCustomSeparators(new Intl.NumberFormat(this.locale, {
			maximumFractionDigits: 0,
			minimumFractionDigits: 0
		}).format(intVal), this.locale, this.decimalSeparator, this.thousandSeparator);
	}
	/** Formats the value as a decimal number. */
	asDecimal(value, decimals) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const digits = decimals ?? this.defaultDecimalDigits ?? 2;
		return applyCustomSeparators(new Intl.NumberFormat(this.locale, {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits
		}).format(num), this.locale, this.decimalSeparator, this.thousandSeparator);
	}
	/** Formats the value as a percent number with "%" sign. */
	asPercent(value, decimals) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const digits = decimals ?? this.defaultDecimalDigits ?? 0;
		return applyCustomSeparators(new Intl.NumberFormat(this.locale, {
			style: "percent",
			minimumFractionDigits: digits,
			maximumFractionDigits: digits
		}).format(num), this.locale, this.decimalSeparator, this.thousandSeparator);
	}
	/** Formats the value as a currency number using ISO 4217 codes. */
	asCurrency(value, currency) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const code = currency ?? this.currencyCode;
		return applyCustomSeparators(new Intl.NumberFormat(this.locale, {
			style: "currency",
			currency: code
		}).format(num), this.locale, this.currencyDecimalSeparator ?? this.decimalSeparator, this.thousandSeparator);
	}
	/** Formats the value as a scientific number (e-notation). */
	asScientific(value, decimals) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const digits = decimals ?? this.defaultDecimalDigits ?? 2;
		return new Intl.NumberFormat(this.locale, {
			notation: "scientific",
			minimumFractionDigits: digits,
			maximumFractionDigits: digits
		}).format(num);
	}
	/**
	* Formats the value as a number spellout (e.g. 42 -> "forty-two").
	* Supports multiple locales via the locales/ registry.
	*/
	asSpellout(value) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const spellout = getSpellout(this.locale);
		if (num === 0) return spellout.zeroWord;
		const isNegative = num < 0;
		const absNum = Math.abs(num);
		const intPart = Math.trunc(absNum);
		const decPart = absNum - intPart;
		let result = spellout.integerToWords(intPart);
		if (decPart > 0) {
			const decDigits = (String(absNum).split(".")[1] ?? "").split("").map((d) => spellout.digitToWord(d));
			result += ` ${spellout.pointWord} ${decDigits.join(" ")}`;
		}
		return isNegative ? `${spellout.negativePrefix} ${result}` : result;
	}
	/**
	* Formats the value as an ordinal number (e.g. 1 -> "1st", 2 -> "2nd").
	* Supports multiple locales via built-in suffix maps and custom overrides
	* through `Formatter.registerOrdinalSuffixes()`.
	*/
	asOrdinal(value) {
		if (isBlank(value)) return this.nullDisplay;
		const num = Math.trunc(normalizeNumber(value));
		try {
			const rule = new Intl.PluralRules(this.locale, { type: "ordinal" }).select(num);
			const lang = this.locale.split("-")[0];
			const enSuffixes = Formatter.ordinalSuffixes.en ?? { other: "th" };
			const langSuffixes = Formatter.ordinalSuffixes[lang] ?? enSuffixes;
			const suffix = langSuffixes[rule] ?? langSuffixes.other ?? "";
			return `${new Intl.NumberFormat(this.locale).format(num)}${suffix}`;
		} catch {
			return `${num}${this.getOrdinalSuffixEn(num)}`;
		}
	}
	/** Built-in ordinal suffix registry. Extensible at runtime. */
	static ordinalSuffixes = {
		en: {
			one: "st",
			two: "nd",
			few: "rd",
			other: "th"
		},
		vi: { other: "" },
		fr: {
			one: "er",
			other: "e"
		},
		de: { other: "." },
		es: { other: "." },
		pt: { other: "." },
		it: { other: "." },
		ja: { other: "" },
		ko: { other: "" },
		zh: { other: "" }
	};
	/**
	* Register ordinal suffixes for a language at runtime.
	* Keys are Intl.PluralRules ordinal categories: "one", "two", "few", "other".
	*/
	static registerOrdinalSuffixes(lang, suffixes) {
		Formatter.ordinalSuffixes[lang] = suffixes;
	}
	/** Formats the value as a date. */
	asDate(value, format) {
		if (isBlank(value)) return this.nullDisplay;
		const date = normalizeDate(value, this.defaultTimeZone);
		const resolved = resolveDateFormat(format ?? this.dateFormat, "medium", "date");
		return new Intl.DateTimeFormat(this.locale, {
			...resolved,
			timeZone: this.timeZone
		}).format(date);
	}
	/** Formats the value as a time. */
	asTime(value, format) {
		if (isBlank(value)) return this.nullDisplay;
		const date = normalizeDate(value, this.defaultTimeZone);
		const resolved = resolveDateFormat(format ?? this.timeFormat, "medium", "time");
		return new Intl.DateTimeFormat(this.locale, {
			...resolved,
			timeZone: this.timeZone
		}).format(date);
	}
	/** Formats the value as a datetime. */
	asDatetime(value, format) {
		if (isBlank(value)) return this.nullDisplay;
		const date = normalizeDate(value, this.defaultTimeZone);
		const resolved = resolveDateFormat(format ?? this.datetimeFormat, "medium", "datetime");
		return new Intl.DateTimeFormat(this.locale, {
			...resolved,
			timeZone: this.timeZone
		}).format(date);
	}
	/** Returns the value as a UNIX timestamp (seconds since epoch). */
	asTimestamp(value) {
		if (isBlank(value)) return this.nullDisplay;
		const date = normalizeDate(value, this.defaultTimeZone);
		return String(Math.floor(date.getTime() / 1e3));
	}
	/**
	* Formats the value as the time interval between a date and now in human readable form.
	* Uses Intl.RelativeTimeFormat (built-in in Node.js / browsers).
	*/
	asRelativeTime(value, referenceTime) {
		if (isBlank(value)) return this.nullDisplay;
		const date = normalizeDate(value, this.defaultTimeZone);
		const ref = referenceTime ? normalizeDate(referenceTime, this.defaultTimeZone) : /* @__PURE__ */ new Date();
		const diffMs = date.getTime() - ref.getTime();
		const diffSec = Math.round(diffMs / 1e3);
		const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "auto" });
		const absSec = Math.abs(diffSec);
		if (absSec < 60) return rtf.format(diffSec, "second");
		if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
		if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
		if (absSec < 2592e3) return rtf.format(Math.round(diffSec / 86400), "day");
		if (absSec < 31536e3) return rtf.format(Math.round(diffSec / 2592e3), "month");
		return rtf.format(Math.round(diffSec / 31536e3), "year");
	}
	/**
	* Represents the value as duration in human readable format.
	* Example: 5400 -> "1 hour, 30 minutes"
	*/
	asDuration(value, implode) {
		if (isBlank(value)) return this.nullDisplay;
		let seconds = Math.abs(normalizeNumber(value));
		const separator = implode ?? ", ";
		if (seconds === 0) return this.getDurationLabel("second", 0);
		const units = [
			{
				unit: "year",
				divisor: 31536e3
			},
			{
				unit: "month",
				divisor: 2592e3
			},
			{
				unit: "day",
				divisor: 86400
			},
			{
				unit: "hour",
				divisor: 3600
			},
			{
				unit: "minute",
				divisor: 60
			},
			{
				unit: "second",
				divisor: 1
			}
		];
		const parts = [];
		for (const { unit, divisor } of units) if (seconds >= divisor) {
			const count = Math.floor(seconds / divisor);
			seconds %= divisor;
			parts.push(this.getDurationLabel(unit, count));
		}
		return parts.join(separator);
	}
	/** Formats the value in bytes as a size in human readable form (e.g. "12 kilobytes"). */
	asSize(value, decimals) {
		return this.formatBytes(value, decimals, "long");
	}
	/** Formats the value in bytes as a size in human readable form (e.g. "12 kB"). */
	asShortSize(value, decimals) {
		return this.formatBytes(value, decimals, "short");
	}
	/** Formats the value as a length in human readable form (e.g. "12 meters"). */
	asLength(value, decimals) {
		return this.formatMeasure(value, "length", "long", decimals);
	}
	/** Formats the value as a length in human readable form (e.g. "12 m"). */
	asShortLength(value, decimals) {
		return this.formatMeasure(value, "length", "short", decimals);
	}
	/** Formats the value as a weight in human readable form (e.g. "12 kilograms"). */
	asWeight(value, decimals) {
		return this.formatMeasure(value, "mass", "long", decimals);
	}
	/** Formats the value as a weight in human readable form (e.g. "12 kg"). */
	asShortWeight(value, decimals) {
		return this.formatMeasure(value, "mass", "short", decimals);
	}
	/**
	* Abbreviate a large number with locale-aware suffixes.
	* e.g. 1500000 -> "1.5 Million" (en) or "1,5 Trieu" (vi).
	*/
	asNumberShort(value, options) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const absNum = Math.abs(num);
		const decimals = options?.decimals ?? 1;
		const fallback = options?.fallback ?? "currency";
		const addSpace = options?.spaceBefore ?? false;
		const config = getNumberShortConfig(this.locale);
		for (const { value: threshold, suffix } of config.thresholds) if (absNum >= threshold) {
			const short = Math.round(num / threshold * 10 ** decimals) / 10 ** decimals;
			const sep = addSpace && !suffix.startsWith(" ") ? " " : "";
			return `${this.asDecimal(short, decimals)}${sep}${suffix}`;
		}
		switch (fallback) {
			case "decimal": return this.asDecimal(num, decimals);
			case "integer": return this.asInteger(num);
			default: return this.asCurrency(num);
		}
	}
	/**
	* Abbreviate a large currency value with locale-aware suffixes and currency symbol.
	* e.g. 1500000 -> "1,50 Triệu ₫" (vi-VN/VND) or "$1.50 Million" (en-US/USD).
	*
	* Uses `asNumberShort()` for the abbreviated number, then appends the
	* currency symbol resolved from `Intl.NumberFormat`.
	*/
	asCurrencyShort(value, options) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const decimals = options?.decimals ?? 2;
		const code = options?.currency ?? this.currencyCode;
		const symbol = new Intl.NumberFormat(this.locale, {
			style: "currency",
			currency: code,
			currencyDisplay: "narrowSymbol"
		}).formatToParts(0).find((p) => p.type === "currency")?.value ?? code;
		return `${this.asNumberShort(num, {
			decimals,
			fallback: "decimal",
			spaceBefore: options?.spaceBefore
		})} ${symbol}`;
	}
	/**
	* Format the GPS (great-circle) distance between two coordinates.
	* Returns a human-readable string with unit suffix.
	*/
	asGpsDistance(latFrom, lonFrom, latTo, lonTo, options) {
		const earthRadius = options?.earthRadius ?? 6371e3;
		const decimals = options?.decimals ?? 1;
		const rawUnit = options?.unit ?? "auto";
		const meters = Formatter.gpsDistance(latFrom, lonFrom, latTo, lonTo, earthRadius);
		let value;
		let unit;
		if (rawUnit === "mi") {
			value = meters / 1609.344;
			unit = "mi";
		} else if (rawUnit === "km") {
			value = meters / 1e3;
			unit = "km";
		} else if (rawUnit === "m") {
			value = meters;
			unit = "m";
		} else if (meters >= 1e3) {
			value = meters / 1e3;
			unit = "km";
		} else {
			value = meters;
			unit = "m";
		}
		return `${this.asDecimal(value, decimals)} ${unit}`;
	}
	/** Haversine formula: returns distance in meters between two GPS coordinates. */
	static gpsDistance(latitudeFrom, longitudeFrom, latitudeTo, longitudeTo, earthRadius = 6371e3) {
		const toRad = (deg) => deg * Math.PI / 180;
		const latFrom = toRad(latitudeFrom);
		const latTo = toRad(latitudeTo);
		const deltaLat = toRad(latitudeTo - latitudeFrom);
		const deltaLon = toRad(longitudeTo - longitudeFrom);
		const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(latFrom) * Math.cos(latTo) * Math.sin(deltaLon / 2) ** 2;
		return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
	}
	/**
	* Mask a string value, showing only the first and last N characters.
	* Instance method with options support.
	*/
	asMaskedValue(value, options) {
		if (isBlank(value)) return this.nullDisplay;
		const str = String(value);
		return Formatter.getMaskedValue(str, options?.startVisible ?? 4, options?.endVisible ?? 3, options?.maskChar ?? "X");
	}
	/** Core masking logic used by asMaskedValue(). */
	static getMaskedValue(value, startVisible = 4, endVisible = 3, maskChar = "X") {
		if (!value) return "";
		const len = value.length;
		if (len <= startVisible + endVisible) return value;
		const start = value.slice(0, startVisible);
		const end = value.slice(len - endVisible);
		return `${start}${maskChar.repeat(len - startVisible - endVisible)}${end}`;
	}
	/**
	* Format bytes into the most appropriate size unit.
	* Supports both base-1024 (binary) and base-1000 (decimal).
	*/
	formatBytes(value, decimals, width) {
		if (isBlank(value)) return this.nullDisplay;
		let bytes = normalizeNumber(value);
		const digits = decimals ?? this.defaultDecimalDigits ?? 2;
		const base = this.sizeFormatBase;
		const isNegative = bytes < 0;
		bytes = Math.abs(bytes);
		const units = base === 1024 ? [
			{
				threshold: 1099511627776,
				long: "terabytes",
				short: "TB"
			},
			{
				threshold: 1073741824,
				long: "gigabytes",
				short: "GB"
			},
			{
				threshold: 1048576,
				long: "megabytes",
				short: "MB"
			},
			{
				threshold: 1024,
				long: "kilobytes",
				short: "KB"
			},
			{
				threshold: 0,
				long: "bytes",
				short: "B"
			}
		] : [
			{
				threshold: 0xe8d4a51000,
				long: "terabytes",
				short: "TB"
			},
			{
				threshold: 1e9,
				long: "gigabytes",
				short: "GB"
			},
			{
				threshold: 1e6,
				long: "megabytes",
				short: "MB"
			},
			{
				threshold: 1e3,
				long: "kilobytes",
				short: "KB"
			},
			{
				threshold: 0,
				long: "bytes",
				short: "B"
			}
		];
		for (const unit of units) if (bytes >= unit.threshold && unit.threshold > 0) {
			const val = bytes / unit.threshold;
			return `${isNegative ? "-" : ""}${this.formatNumberPart(val, digits)} ${width === "long" ? unit.long : unit.short}`;
		}
		return `${isNegative ? "-" : ""}${Math.round(bytes)} ${width === "long" ? "bytes" : "B"}`;
	}
	/**
	* Format a measurement value (length or mass).
	* Automatically selects the most appropriate unit based on value magnitude.
	*/
	formatMeasure(value, type, width, decimals) {
		if (isBlank(value)) return this.nullDisplay;
		const num = normalizeNumber(value);
		const digits = decimals ?? this.defaultDecimalDigits ?? 2;
		const configs = this.getMeasureUnits(type);
		const isNegative = num < 0;
		const absNum = Math.abs(num);
		for (let i = configs.length - 1; i >= 0; i--) {
			const config = configs[i];
			if (!config) continue;
			if (absNum >= config.factor || i === 0) {
				const val = absNum / config.factor;
				return `${isNegative ? "-" : ""}${this.formatNumberPart(val, digits)} ${width === "long" ? config.longLabel : config.shortLabel}`;
			}
		}
		return String(num);
	}
	/** Get measurement unit configs for the configured system (metric/imperial). */
	getMeasureUnits(type) {
		if (type === "length") {
			if (this.systemOfUnits === "imperial") return [
				{
					factor: 1,
					longLabel: "inches",
					shortLabel: "in"
				},
				{
					factor: 12,
					longLabel: "feet",
					shortLabel: "ft"
				},
				{
					factor: 36,
					longLabel: "yards",
					shortLabel: "yd"
				},
				{
					factor: 63360,
					longLabel: "miles",
					shortLabel: "mi"
				}
			];
			return [
				{
					factor: 1,
					longLabel: "millimeters",
					shortLabel: "mm"
				},
				{
					factor: 1e3,
					longLabel: "meters",
					shortLabel: "m"
				},
				{
					factor: 1e6,
					longLabel: "kilometers",
					shortLabel: "km"
				}
			];
		}
		if (this.systemOfUnits === "imperial") return [
			{
				factor: 1,
				longLabel: "grains",
				shortLabel: "gr"
			},
			{
				factor: 437.5,
				longLabel: "ounces",
				shortLabel: "oz"
			},
			{
				factor: 7e3,
				longLabel: "pounds",
				shortLabel: "lb"
			}
		];
		return [
			{
				factor: 1,
				longLabel: "grams",
				shortLabel: "g"
			},
			{
				factor: 1e3,
				longLabel: "kilograms",
				shortLabel: "kg"
			},
			{
				factor: 1e6,
				longLabel: "tons",
				shortLabel: "t"
			}
		];
	}
	/** Format the numeric part of a result using locale-aware Intl. */
	formatNumberPart(num, digits) {
		return applyCustomSeparators(new Intl.NumberFormat(this.locale, {
			minimumFractionDigits: 0,
			maximumFractionDigits: digits
		}).format(num), this.locale, this.decimalSeparator, this.thousandSeparator);
	}
	/** Create a locale-aware duration label using Intl unit formatting. */
	getDurationLabel(unit, count) {
		try {
			const intlUnit = unit === "month" ? "month" : unit;
			return new Intl.NumberFormat(this.locale, {
				style: "unit",
				unit: intlUnit,
				unitDisplay: "long"
			}).format(count);
		} catch {
			return `${count} ${unit}${count !== 1 ? "s" : ""}`;
		}
	}
	/** English ordinal suffix fallback. */
	getOrdinalSuffixEn(n) {
		const abs = Math.abs(n);
		const mod100 = abs % 100;
		if (mod100 >= 11 && mod100 <= 13) return "th";
		switch (abs % 10) {
			case 1: return "st";
			case 2: return "nd";
			case 3: return "rd";
			default: return "th";
		}
	}
};
// src/global.ts
/**
* Global singleton Formatter instance.
*
* Usage: import once at app entry, configure once, then use `formatter` everywhere.
*
* ```ts
* // main.ts (once)
* import { configureFormatter } from "@template/helpers"
* configureFormatter({ locale: "vi-VN", currencyCode: "VND" })
*
* // any-page.tsx (no setup needed)
* import { formatter } from "@template/helpers"
* formatter.asCurrency(1234567)
* ```
*/
let instance = new Formatter();
/** The global Formatter singleton. Ready to use after `configureFormatter()`. */
const formatter = new Proxy({}, { get(_target, prop, receiver) {
	return Reflect.get(instance, prop, receiver);
} });
/**
* Configure the global formatter once (typically at app bootstrap).
* Replaces the internal instance - all existing `formatter` references
* automatically pick up the new config via the proxy.
*/
function configureFormatter(options) {
	instance = new Formatter(options);
}
/**
* Format a date value safely for display using the global formatter.
* Returns `fallback` (default: "\u2014") for null, undefined, empty, or invalid dates.
* Uses the global formatter's `defaultTimeZone` to reinterpret Z-suffix strings.
*/
function formatDate(date, fallback = "—") {
	if (!date) return fallback;
	try {
		const d = parseDate(date, instance.defaultTimeZone);
		if (Number.isNaN(d.getTime())) return fallback;
		return formatter.asDate(d);
	} catch {
		return fallback;
	}
}
/**
* Format a value as a percentage for display using the global formatter.
* - If the string already contains "%", returns it as-is.
* - Values between 0 and 1 (exclusive) are treated as ratios (multiplied by 100).
* - Returns `fallback` (default: "\u2014") for null/undefined/unparseable values.
*/
function formatPercent(value, fallback = "—") {
	if (value === null || value === void 0) return fallback;
	if (typeof value === "string") {
		if (value.trim() === "") return fallback;
		if (value.includes("%")) return value;
		const num = Number(value);
		if (Number.isNaN(num)) return value || fallback;
		const pct = num > 0 && num <= 1 ? num * 100 : num;
		return `${formatter.asDecimal(pct, 2)}%`;
	}
	const pct = value > 0 && value <= 1 ? value * 100 : value;
	return `${formatter.asDecimal(pct, 2)}%`;
}
export { Formatter, configureFormatter, escapeHtml, formatDate, formatPercent, formatter, getIANAOffset, getNumberShortConfig, getSpellout, normalizeDate, normalizeNumber, parseDate, registerNumberShort, registerSpellout };

//# sourceMappingURL=index.mjs.map