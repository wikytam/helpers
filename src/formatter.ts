import { getNumberShortConfig, getSpellout } from "./locales/index.js"
import type {
	EmailOptions,
	FormatterOptions,
	FormatWidth,
	GpsDistanceOptions,
	HtmlSanitizeConfig,
	ImageOptions,
	MaskOptions,
	MeasureUnitConfig,
	NumberShortOptions,
	OrdinalSuffixMap,
	ParagraphOptions,
	UnitSystem,
	UrlOptions,
} from "./types.js"
import {
	applyCustomSeparators,
	escapeHtml,
	normalizeDate,
	normalizeNumber,
	resolveDateFormat,
} from "./utils.js"

/**
 * TypeScript port of yii\i18n\Formatter.
 *
 * Uses only built-in Intl APIs - zero external dependencies.
 * Supports: strings, HTML, numbers, currency, dates, times,
 * file sizes, measurement units, and more.
 */
export class Formatter {
	public locale: string
	public timeZone: string
	public defaultTimeZone: string
	public dateFormat: string | Intl.DateTimeFormatOptions
	public timeFormat: string | Intl.DateTimeFormatOptions
	public datetimeFormat: string | Intl.DateTimeFormatOptions
	public booleanFormat: [string, string]
	public nullDisplay: string
	public currencyCode: string
	public decimalSeparator: string | null
	public thousandSeparator: string | null
	public currencyDecimalSeparator: string | null
	public sizeFormatBase: 1024 | 1000
	public systemOfUnits: UnitSystem
	public defaultDecimalDigits: number | null

	constructor(options: FormatterOptions = {}) {
		this.locale = options.locale ?? "en-US"
		this.timeZone = options.timeZone ?? "UTC"
		this.defaultTimeZone = options.defaultTimeZone ?? "UTC"
		this.dateFormat = options.dateFormat ?? "medium"
		this.timeFormat = options.timeFormat ?? "medium"
		this.datetimeFormat = options.datetimeFormat ?? "medium"
		this.booleanFormat = options.booleanFormat ?? ["No", "Yes"]
		this.nullDisplay = options.nullDisplay ?? "(not set)"
		this.currencyCode = options.currencyCode ?? "USD"
		this.decimalSeparator = options.decimalSeparator ?? null
		this.thousandSeparator = options.thousandSeparator ?? null
		this.currencyDecimalSeparator = options.currencyDecimalSeparator ?? null
		this.sizeFormatBase = options.sizeFormatBase ?? 1024
		this.systemOfUnits = options.systemOfUnits ?? "metric"
		this.defaultDecimalDigits = options.defaultDecimalDigits ?? null
	}

	// ─── Generic dispatch ─────────────────────────────────────────────

	/**
	 * Format a value by type name, like Yii2's `$formatter->format($value, 'date')`.
	 * Supports both string and tuple `[formatName, ...params]` signatures.
	 */
	public format(value: unknown, type: string | [string, ...unknown[]]): string {
		if (value === null || value === undefined) return this.nullDisplay

		const formatName = Array.isArray(type) ? type[0] : type
		const params = Array.isArray(type) ? type.slice(1) : []
		const methodName = `as${formatName.charAt(0).toUpperCase()}${formatName.slice(1)}`

		const method = (this as Record<string, unknown>)[methodName]
		if (typeof method === "function") {
			return (method as (...args: unknown[]) => string).call(
				this,
				value,
				...params,
			)
		}

		throw new Error(`Unknown format type: ${formatName}`)
	}

	// ─── String & HTML ────────────────────────────────────────────────

	/** Returns the value as-is without any formatting. */
	public asRaw(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		return String(value)
	}

	/** Formats the value as HTML-encoded plain text. */
	public asText(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		return escapeHtml(String(value))
	}

	/**
	 * Formats the value as HTML-encoded text with newlines converted to `<br />`.
	 * Handles all line-ending variants: `\r\n` (Windows), `\r` (old Mac), `\n` (Unix).
	 * Consecutive newlines produce multiple `<br />` tags.
	 */
	public asNtext(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		const escaped = escapeHtml(String(value))
		return escaped.replace(/\r\n/g, "<br />").replace(/[\r\n]/g, "<br />")
	}

	/**
	 * Formats the value as HTML-encoded text paragraphs (split by double newlines).
	 * Supports configurable wrapper tag and inline line-break conversion.
	 */
	public asParagraphs(value: unknown, options?: ParagraphOptions): string {
		if (value === null || value === undefined) return this.nullDisplay
		const tag = options?.tag ?? "p"
		const lineBreaks = options?.lineBreaks ?? false
		const text = String(value)
		// Normalize line endings before splitting
		const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
		const paragraphs = normalized.split(/\n\s*\n/)
		return paragraphs
			.map((p) => {
				let content = escapeHtml(p.trim())
				if (lineBreaks) {
					content = content.replace(/\n/g, "<br />")
				}
				return `<${tag}>${content}</${tag}>`
			})
			.filter((p) => p !== `<${tag}></${tag}>`)
			.join("\n")
	}

	/**
	 * Returns the value as HTML text.
	 * When a sanitize config is provided, only allowed tags and attributes are kept.
	 * Without config, the value is returned as-is (caller is responsible for safety).
	 */
	public asHtml(value: unknown, sanitize?: HtmlSanitizeConfig): string {
		if (value === null || value === undefined) return this.nullDisplay
		const html = String(value)
		if (!sanitize) return html
		return Formatter.sanitizeHtml(html, sanitize)
	}

	/**
	 * Allowlist-based HTML sanitizer. Strips tags and attributes not in the config.
	 * Handles self-closing tags, nested tags, and attribute filtering.
	 */
	private static sanitizeHtml(
		html: string,
		config: HtmlSanitizeConfig,
	): string {
		const allowedTags = new Set(
			(config.allowedTags ?? []).map((t) => t.toLowerCase()),
		)
		const allowedAttrs = config.allowedAttributes ?? {}

		// Match opening tags, closing tags, and self-closing tags
		return html.replace(
			/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\s*\/?>/g,
			(match, tagName: string, attrsStr: string) => {
				const tag = tagName.toLowerCase()
				if (!allowedTags.has(tag)) return ""

				const isClosing = match.startsWith("</")
				if (isClosing) return `</${tag}>`

				const isSelfClosing = match.endsWith("/>")
				const tagAllowedAttrs = new Set(
					(allowedAttrs[tag] ?? []).map((a) => a.toLowerCase()),
				)

				// Parse and filter attributes
				const filteredAttrs: string[] = []
				const attrRegex =
					/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
				let attrMatch: RegExpExecArray | null = null
				while (true) {
					attrMatch = attrRegex.exec(attrsStr)
					if (!attrMatch) break
					const attrName = attrMatch[1].toLowerCase()
					if (tagAllowedAttrs.has(attrName)) {
						const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4]
						if (attrValue !== undefined) {
							filteredAttrs.push(`${attrName}="${escapeHtml(attrValue)}"`)
						} else {
							filteredAttrs.push(attrName)
						}
					}
				}

				const attrsOut =
					filteredAttrs.length > 0 ? ` ${filteredAttrs.join(" ")}` : ""
				return isSelfClosing ? `<${tag}${attrsOut} />` : `<${tag}${attrsOut}>`
			},
		)
	}

	/**
	 * Formats the value as a mailto link.
	 * Supports custom display text, subject, and body parameters.
	 * Validates email format - returns escaped plain text for invalid emails.
	 */
	public asEmail(value: unknown, options?: EmailOptions): string {
		if (value === null || value === undefined) return this.nullDisplay
		const email = String(value)

		if (!Formatter.isValidEmail(email)) {
			return escapeHtml(email)
		}

		const params: string[] = []
		if (options?.subject)
			params.push(`subject=${encodeURIComponent(options.subject)}`)
		if (options?.body) params.push(`body=${encodeURIComponent(options.body)}`)
		const query = params.length > 0 ? `?${params.join("&")}` : ""
		const displayText = escapeHtml(options?.text ?? email)

		return `<a href="mailto:${escapeHtml(email)}${query}">${displayText}</a>`
	}

	/** Basic email format validation (covers most common patterns). */
	private static isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	}

	/**
	 * Formats the value as a hyperlink.
	 * Detects http, https, ftp, ftps, and mailto schemes.
	 * Prepends `http://` when no recognized scheme is present.
	 */
	public asUrl(value: unknown, options?: UrlOptions): string {
		if (value === null || value === undefined) return this.nullDisplay
		const url = String(value)
		const href = /^(https?|ftps?|mailto):/i.test(url) ? url : `http://${url}`
		const target = options?.target ?? "_blank"
		const displayText = escapeHtml(options?.text ?? url)

		const attrs: string[] = [
			`href="${escapeHtml(href)}"`,
			`target="${escapeHtml(target)}"`,
		]
		if (options?.rel) attrs.push(`rel="${escapeHtml(options.rel)}"`)
		if (options?.class) attrs.push(`class="${escapeHtml(options.class)}"`)

		return `<a ${attrs.join(" ")}>${displayText}</a>`
	}

	/**
	 * Formats the value as an image tag.
	 * Supports width, height, CSS class, and loading strategy attributes.
	 */
	public asImage(value: unknown, options?: ImageOptions): string {
		if (value === null || value === undefined) return this.nullDisplay
		const src = String(value)
		const alt = options?.alt ?? ""

		const attrs: string[] = [
			`src="${escapeHtml(src)}"`,
			`alt="${escapeHtml(alt)}"`,
		]
		if (options?.width != null)
			attrs.push(`width="${escapeHtml(String(options.width))}"`)
		if (options?.height != null)
			attrs.push(`height="${escapeHtml(String(options.height))}"`)
		if (options?.class) attrs.push(`class="${escapeHtml(options.class)}"`)
		if (options?.loading) attrs.push(`loading="${escapeHtml(options.loading)}"`)

		return `<img ${attrs.join(" ")} />`
	}

	/** Formats the value as a boolean using the configured booleanFormat labels. */
	public asBoolean(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		return value ? this.booleanFormat[1] : this.booleanFormat[0]
	}

	// ─── Number & Currency ────────────────────────────────────────────

	/** Formats the value as an integer by removing decimal digits without rounding. */
	public asInteger(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const intVal = Math.trunc(num)

		const formatted = new Intl.NumberFormat(this.locale, {
			maximumFractionDigits: 0,
			minimumFractionDigits: 0,
		}).format(intVal)

		return applyCustomSeparators(
			formatted,
			this.locale,
			this.decimalSeparator,
			this.thousandSeparator,
		)
	}

	/** Formats the value as a decimal number. */
	public asDecimal(value: unknown, decimals?: number): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const digits = decimals ?? this.defaultDecimalDigits ?? 2

		const formatted = new Intl.NumberFormat(this.locale, {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
		}).format(num)

		return applyCustomSeparators(
			formatted,
			this.locale,
			this.decimalSeparator,
			this.thousandSeparator,
		)
	}

	/** Formats the value as a percent number with "%" sign. */
	public asPercent(value: unknown, decimals?: number): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const digits = decimals ?? this.defaultDecimalDigits ?? 0

		const formatted = new Intl.NumberFormat(this.locale, {
			style: "percent",
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
		}).format(num)

		return applyCustomSeparators(
			formatted,
			this.locale,
			this.decimalSeparator,
			this.thousandSeparator,
		)
	}

	/** Formats the value as a currency number using ISO 4217 codes. */
	public asCurrency(value: unknown, currency?: string): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const code = currency ?? this.currencyCode

		const formatted = new Intl.NumberFormat(this.locale, {
			style: "currency",
			currency: code,
		}).format(num)

		return applyCustomSeparators(
			formatted,
			this.locale,
			this.currencyDecimalSeparator ?? this.decimalSeparator,
			this.thousandSeparator,
		)
	}

	/** Formats the value as a scientific number (e-notation). */
	public asScientific(value: unknown, decimals?: number): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const digits = decimals ?? this.defaultDecimalDigits ?? 2

		return new Intl.NumberFormat(this.locale, {
			notation: "scientific",
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
		}).format(num)
	}

	/**
	 * Formats the value as a number spellout (e.g. 42 -> "forty-two").
	 * Supports multiple locales via the locales/ registry.
	 */
	public asSpellout(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)

		const spellout = getSpellout(this.locale)

		if (num === 0) return spellout.zeroWord

		const isNegative = num < 0
		const absNum = Math.abs(num)
		const intPart = Math.trunc(absNum)
		const decPart = absNum - intPart

		let result = spellout.integerToWords(intPart)

		if (decPart > 0) {
			const decStr = String(absNum).split(".")[1] ?? ""
			const decDigits = decStr.split("").map((d) => spellout.digitToWord(d))
			result += ` ${spellout.pointWord} ${decDigits.join(" ")}`
		}

		return isNegative ? `${spellout.negativePrefix} ${result}` : result
	}

	/**
	 * Formats the value as an ordinal number (e.g. 1 -> "1st", 2 -> "2nd").
	 * Supports multiple locales via built-in suffix maps and custom overrides
	 * through `Formatter.registerOrdinalSuffixes()`.
	 */
	public asOrdinal(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = Math.trunc(normalizeNumber(value))

		try {
			const pr = new Intl.PluralRules(this.locale, { type: "ordinal" })
			const rule = pr.select(num)

			const lang = this.locale.split("-")[0]
			const enSuffixes = Formatter.ordinalSuffixes.en ?? { other: "th" }
			const langSuffixes = Formatter.ordinalSuffixes[lang] ?? enSuffixes
			const suffix = langSuffixes[rule] ?? langSuffixes.other ?? ""

			return `${new Intl.NumberFormat(this.locale).format(num)}${suffix}`
		} catch {
			return `${num}${this.getOrdinalSuffixEn(num)}`
		}
	}

	/** Built-in ordinal suffix registry. Extensible at runtime. */
	private static ordinalSuffixes: Record<string, OrdinalSuffixMap> = {
		en: { one: "st", two: "nd", few: "rd", other: "th" },
		vi: { other: "" },
		fr: { one: "er", other: "e" },
		de: { other: "." },
		es: { other: "." },
		pt: { other: "." },
		it: { other: "." },
		ja: { other: "" },
		ko: { other: "" },
		zh: { other: "" },
	}

	/**
	 * Register ordinal suffixes for a language at runtime.
	 * Keys are Intl.PluralRules ordinal categories: "one", "two", "few", "other".
	 */
	public static registerOrdinalSuffixes(
		lang: string,
		suffixes: OrdinalSuffixMap,
	): void {
		Formatter.ordinalSuffixes[lang] = suffixes
	}

	// ─── Date & Time ──────────────────────────────────────────────────

	/** Formats the value as a date. */
	public asDate(
		value: unknown,
		format?: string | Intl.DateTimeFormatOptions,
	): string {
		if (value === null || value === undefined) return this.nullDisplay
		const date = normalizeDate(value)
		const resolved = resolveDateFormat(
			format ?? this.dateFormat,
			"medium",
			"date",
		)

		return new Intl.DateTimeFormat(this.locale, {
			...resolved,
			timeZone: this.timeZone,
		}).format(date)
	}

	/** Formats the value as a time. */
	public asTime(
		value: unknown,
		format?: string | Intl.DateTimeFormatOptions,
	): string {
		if (value === null || value === undefined) return this.nullDisplay
		const date = normalizeDate(value)
		const resolved = resolveDateFormat(
			format ?? this.timeFormat,
			"medium",
			"time",
		)

		return new Intl.DateTimeFormat(this.locale, {
			...resolved,
			timeZone: this.timeZone,
		}).format(date)
	}

	/** Formats the value as a datetime. */
	public asDatetime(
		value: unknown,
		format?: string | Intl.DateTimeFormatOptions,
	): string {
		if (value === null || value === undefined) return this.nullDisplay
		const date = normalizeDate(value)
		const resolved = resolveDateFormat(
			format ?? this.datetimeFormat,
			"medium",
			"datetime",
		)

		return new Intl.DateTimeFormat(this.locale, {
			...resolved,
			timeZone: this.timeZone,
		}).format(date)
	}

	/** Returns the value as a UNIX timestamp (seconds since epoch). */
	public asTimestamp(value: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay
		const date = normalizeDate(value)
		return String(Math.floor(date.getTime() / 1000))
	}

	/**
	 * Formats the value as the time interval between a date and now in human readable form.
	 * Uses Intl.RelativeTimeFormat (built-in in Node.js / browsers).
	 */
	public asRelativeTime(value: unknown, referenceTime?: unknown): string {
		if (value === null || value === undefined) return this.nullDisplay

		const date = normalizeDate(value)
		const ref = referenceTime ? normalizeDate(referenceTime) : new Date()
		const diffMs = date.getTime() - ref.getTime()
		const diffSec = Math.round(diffMs / 1000)

		const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "auto" })

		const absSec = Math.abs(diffSec)
		if (absSec < 60) return rtf.format(diffSec, "second")
		if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute")
		if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), "hour")
		if (absSec < 2592000) return rtf.format(Math.round(diffSec / 86400), "day")
		if (absSec < 31536000)
			return rtf.format(Math.round(diffSec / 2592000), "month")
		return rtf.format(Math.round(diffSec / 31536000), "year")
	}

	/**
	 * Represents the value as duration in human readable format.
	 * Example: 5400 -> "1 hour, 30 minutes"
	 */
	public asDuration(value: unknown, implode?: string): string {
		if (value === null || value === undefined) return this.nullDisplay
		let seconds = Math.abs(normalizeNumber(value))
		const separator = implode ?? ", "

		if (seconds === 0) return this.getDurationLabel("second", 0)

		const units: Array<{ unit: string; divisor: number }> = [
			{ unit: "year", divisor: 31536000 },
			{ unit: "month", divisor: 2592000 },
			{ unit: "day", divisor: 86400 },
			{ unit: "hour", divisor: 3600 },
			{ unit: "minute", divisor: 60 },
			{ unit: "second", divisor: 1 },
		]

		const parts: string[] = []
		for (const { unit, divisor } of units) {
			if (seconds >= divisor) {
				const count = Math.floor(seconds / divisor)
				seconds %= divisor
				parts.push(this.getDurationLabel(unit, count))
			}
		}

		return parts.join(separator)
	}

	// ─── Size & Measurement ──────────────────────────────────────────

	/** Formats the value in bytes as a size in human readable form (e.g. "12 kilobytes"). */
	public asSize(value: unknown, decimals?: number): string {
		return this.formatBytes(value, decimals, "long")
	}

	/** Formats the value in bytes as a size in human readable form (e.g. "12 kB"). */
	public asShortSize(value: unknown, decimals?: number): string {
		return this.formatBytes(value, decimals, "short")
	}

	/** Formats the value as a length in human readable form (e.g. "12 meters"). */
	public asLength(value: unknown, decimals?: number): string {
		return this.formatMeasure(value, "length", "long", decimals)
	}

	/** Formats the value as a length in human readable form (e.g. "12 m"). */
	public asShortLength(value: unknown, decimals?: number): string {
		return this.formatMeasure(value, "length", "short", decimals)
	}

	/** Formats the value as a weight in human readable form (e.g. "12 kilograms"). */
	public asWeight(value: unknown, decimals?: number): string {
		return this.formatMeasure(value, "mass", "long", decimals)
	}

	/** Formats the value as a weight in human readable form (e.g. "12 kg"). */
	public asShortWeight(value: unknown, decimals?: number): string {
		return this.formatMeasure(value, "mass", "short", decimals)
	}

	// ─── Utility Methods ─────────────────────────────────────────────

	/**
	 * Abbreviate a large number with locale-aware suffixes.
	 * e.g. 1500000 -> "1.5 Million" (en) or "1,5 Trieu" (vi).
	 */
	public asNumberShort(value: unknown, options?: NumberShortOptions): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const absNum = Math.abs(num)
		const decimals = options?.decimals ?? 1
		const fallback = options?.fallback ?? "currency"
		const addSpace = options?.spaceBefore ?? false
		const config = getNumberShortConfig(this.locale)

		for (const { value: threshold, suffix } of config.thresholds) {
			if (absNum >= threshold) {
				const short =
					Math.round((num / threshold) * 10 ** decimals) / 10 ** decimals
				const sep = addSpace && !suffix.startsWith(" ") ? " " : ""
				return `${this.asDecimal(short, decimals)}${sep}${suffix}`
			}
		}

		switch (fallback) {
			case "decimal":
				return this.asDecimal(num, decimals)
			case "integer":
				return this.asInteger(num)
			default:
				return this.asCurrency(num)
		}
	}

	/**
	 * Format the GPS (great-circle) distance between two coordinates.
	 * Returns a human-readable string with unit suffix.
	 */
	public asGpsDistance(
		latFrom: number,
		lonFrom: number,
		latTo: number,
		lonTo: number,
		options?: GpsDistanceOptions,
	): string {
		const earthRadius = options?.earthRadius ?? 6_371_000
		const decimals = options?.decimals ?? 1
		const rawUnit = options?.unit ?? "auto"
		const meters = Formatter.gpsDistance(
			latFrom,
			lonFrom,
			latTo,
			lonTo,
			earthRadius,
		)

		let value: number
		let unit: string
		if (rawUnit === "mi") {
			value = meters / 1609.344
			unit = "mi"
		} else if (rawUnit === "km") {
			value = meters / 1000
			unit = "km"
		} else if (rawUnit === "m") {
			value = meters
			unit = "m"
		} else {
			// auto: use km if >= 1000m, otherwise m
			if (meters >= 1000) {
				value = meters / 1000
				unit = "km"
			} else {
				value = meters
				unit = "m"
			}
		}

		return `${this.asDecimal(value, decimals)} ${unit}`
	}

	/** Haversine formula: returns distance in meters between two GPS coordinates. */
	private static gpsDistance(
		latitudeFrom: number,
		longitudeFrom: number,
		latitudeTo: number,
		longitudeTo: number,
		earthRadius = 6_371_000,
	): number {
		const toRad = (deg: number) => (deg * Math.PI) / 180

		const latFrom = toRad(latitudeFrom)
		const latTo = toRad(latitudeTo)
		const deltaLat = toRad(latitudeTo - latitudeFrom)
		const deltaLon = toRad(longitudeTo - longitudeFrom)

		const a =
			Math.sin(deltaLat / 2) ** 2 +
			Math.cos(latFrom) * Math.cos(latTo) * Math.sin(deltaLon / 2) ** 2
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

		return earthRadius * c
	}

	/**
	 * Mask a string value, showing only the first and last N characters.
	 * Instance method with options support.
	 */
	public asMaskedValue(value: unknown, options?: MaskOptions): string {
		if (value === null || value === undefined) return this.nullDisplay
		const str = String(value)
		return Formatter.getMaskedValue(
			str,
			options?.startVisible ?? 4,
			options?.endVisible ?? 3,
			options?.maskChar ?? "X",
		)
	}

	/** Core masking logic used by asMaskedValue(). */
	private static getMaskedValue(
		value: string,
		startVisible = 4,
		endVisible = 3,
		maskChar = "X",
	): string {
		if (!value) return ""
		const len = value.length

		if (len <= startVisible + endVisible) return value

		const start = value.slice(0, startVisible)
		const end = value.slice(len - endVisible)
		const masked = maskChar.repeat(len - startVisible - endVisible)

		return `${start}${masked}${end}`
	}

	// ─── Private helpers ──────────────────────────────────────────────

	/**
	 * Format bytes into the most appropriate size unit.
	 * Supports both base-1024 (binary) and base-1000 (decimal).
	 */
	private formatBytes(
		value: unknown,
		decimals: number | undefined,
		width: FormatWidth,
	): string {
		if (value === null || value === undefined) return this.nullDisplay
		let bytes = normalizeNumber(value)
		const digits = decimals ?? this.defaultDecimalDigits ?? 2
		const base = this.sizeFormatBase

		const isNegative = bytes < 0
		bytes = Math.abs(bytes)

		type SizeUnit = {
			threshold: number
			long: string
			short: string
		}

		const units1024: SizeUnit[] = [
			{ threshold: 1099511627776, long: "terabytes", short: "TB" },
			{ threshold: 1073741824, long: "gigabytes", short: "GB" },
			{ threshold: 1048576, long: "megabytes", short: "MB" },
			{ threshold: 1024, long: "kilobytes", short: "KB" },
			{ threshold: 0, long: "bytes", short: "B" },
		]

		const units1000: SizeUnit[] = [
			{ threshold: 1000000000000, long: "terabytes", short: "TB" },
			{ threshold: 1000000000, long: "gigabytes", short: "GB" },
			{ threshold: 1000000, long: "megabytes", short: "MB" },
			{ threshold: 1000, long: "kilobytes", short: "KB" },
			{ threshold: 0, long: "bytes", short: "B" },
		]

		const units = base === 1024 ? units1024 : units1000

		for (const unit of units) {
			if (bytes >= unit.threshold && unit.threshold > 0) {
				const val = bytes / unit.threshold
				const sign = isNegative ? "-" : ""
				const formatted = this.formatNumberPart(val, digits)
				const label = width === "long" ? unit.long : unit.short
				return `${sign}${formatted} ${label}`
			}
		}

		const sign = isNegative ? "-" : ""
		const label = width === "long" ? "bytes" : "B"
		return `${sign}${Math.round(bytes)} ${label}`
	}

	/**
	 * Format a measurement value (length or mass).
	 * Automatically selects the most appropriate unit based on value magnitude.
	 */
	private formatMeasure(
		value: unknown,
		type: "length" | "mass",
		width: FormatWidth,
		decimals?: number,
	): string {
		if (value === null || value === undefined) return this.nullDisplay
		const num = normalizeNumber(value)
		const digits = decimals ?? this.defaultDecimalDigits ?? 2

		const configs = this.getMeasureUnits(type)
		const isNegative = num < 0
		const absNum = Math.abs(num)

		// Find the best-fitting unit (largest unit where value >= 1)
		for (let i = configs.length - 1; i >= 0; i--) {
			const config = configs[i]
			if (!config) continue
			if (absNum >= config.factor || i === 0) {
				const val = absNum / config.factor
				const sign = isNegative ? "-" : ""
				const formatted = this.formatNumberPart(val, digits)
				const label = width === "long" ? config.longLabel : config.shortLabel
				return `${sign}${formatted} ${label}`
			}
		}

		return String(num)
	}

	/** Get measurement unit configs for the configured system (metric/imperial). */
	private getMeasureUnits(type: "length" | "mass"): MeasureUnitConfig[] {
		if (type === "length") {
			if (this.systemOfUnits === "imperial") {
				return [
					{ factor: 1, longLabel: "inches", shortLabel: "in" },
					{ factor: 12, longLabel: "feet", shortLabel: "ft" },
					{ factor: 36, longLabel: "yards", shortLabel: "yd" },
					{ factor: 63360, longLabel: "miles", shortLabel: "mi" },
				]
			}
			return [
				{ factor: 1, longLabel: "millimeters", shortLabel: "mm" },
				{ factor: 1000, longLabel: "meters", shortLabel: "m" },
				{ factor: 1000000, longLabel: "kilometers", shortLabel: "km" },
			]
		}

		if (this.systemOfUnits === "imperial") {
			return [
				{ factor: 1, longLabel: "grains", shortLabel: "gr" },
				{ factor: 437.5, longLabel: "ounces", shortLabel: "oz" },
				{ factor: 7000, longLabel: "pounds", shortLabel: "lb" },
			]
		}
		return [
			{ factor: 1, longLabel: "grams", shortLabel: "g" },
			{ factor: 1000, longLabel: "kilograms", shortLabel: "kg" },
			{ factor: 1000000, longLabel: "tons", shortLabel: "t" },
		]
	}

	/** Format the numeric part of a result using locale-aware Intl. */
	private formatNumberPart(num: number, digits: number): string {
		const formatted = new Intl.NumberFormat(this.locale, {
			minimumFractionDigits: 0,
			maximumFractionDigits: digits,
		}).format(num)

		return applyCustomSeparators(
			formatted,
			this.locale,
			this.decimalSeparator,
			this.thousandSeparator,
		)
	}

	/** Create a locale-aware duration label using Intl unit formatting. */
	private getDurationLabel(unit: string, count: number): string {
		try {
			const intlUnit = unit === "month" ? "month" : unit
			return new Intl.NumberFormat(this.locale, {
				style: "unit",
				unit: intlUnit,
				unitDisplay: "long",
			}).format(count)
		} catch {
			const plural = count !== 1 ? "s" : ""
			return `${count} ${unit}${plural}`
		}
	}

	/** English ordinal suffix fallback. */
	private getOrdinalSuffixEn(n: number): string {
		const abs = Math.abs(n)
		const mod100 = abs % 100
		if (mod100 >= 11 && mod100 <= 13) return "th"
		switch (abs % 10) {
			case 1:
				return "st"
			case 2:
				return "nd"
			case 3:
				return "rd"
			default:
				return "th"
		}
	}
}
