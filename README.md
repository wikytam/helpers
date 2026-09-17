# @wikytam/helpers

A TypeScript utility library ported from [yii\i18n\Formatter](https://www.yiiframework.com/doc/api/2.0/yii-i18n-formatter) and common Yii2 helpers, with **zero external dependencies** - uses only built-in `Intl` APIs.

| | Size |
|---|---|
| ESM | 35.2 kB (9.5 kB gzip) |
| CJS | 35.5 kB (9.6 kB gzip) |
| Types | 16.0 kB |

## Installation

```bash
npm install @wikytam/helpers
# or
pnpm add @wikytam/helpers
# or
yarn add @wikytam/helpers
```

```typescript
import { Formatter } from "@wikytam/helpers"
```

## Quick Start

```typescript
import { Formatter } from "@wikytam/helpers"

const f = new Formatter({
  locale: "en-US",
  timeZone: "UTC",
  currencyCode: "USD",
})

f.asDate("2024-03-15")       // "Mar 15, 2024"
f.asCurrency(1234.56)        // "$1,234.56"
f.asPercent(0.156, 1)        // "15.6%"
f.asShortSize(1048576)       // "1 MB"
f.asRelativeTime(pastDate)   // "2 days ago"
f.asBoolean(true)            // "Yes"
f.asSpellout(42)             // "forty-two"
f.asOrdinal(3)               // "3rd"
```



## Global Singleton (Configure Once, Use Everywhere)

The package ships a built-in global `formatter` singleton. Call `configureFormatter()` **once** at app startup, then import `formatter` in any file - no extra setup needed.

### Step 1: Configure once at app entry

```typescript
// Call at your app entry point (main.tsx or main.ts)
// Only needs to be called ONCE - the formatter will be available globally
import { configureFormatter } from "@wikytam/helpers"

configureFormatter({
  locale: "vi-VN",
  timeZone: "Asia/Ho_Chi_Minh",
  currencyCode: "VND",
  booleanFormat: ["Không", "Có"],           // Vietnamese: [false, true] labels
  nullDisplay: "(chua dat)",                // Vietnamese: shown for null/undefined
  decimalSeparator: ",",
  thousandSeparator: ".",
})
```

### Step 2: Use anywhere - just import `formatter`

```typescript
// ANY page, component, or service - just import and use
// No need to pass instances, no need to create wrapper files
import { formatter } from "@wikytam/helpers"

formatter.asCurrency(1234567)        // "1.234.567 d"
formatter.asDate("2024-03-15")       // "15 thg 3, 2024"
formatter.asBoolean(true)            // "Có"
formatter.asSpellout(42)             // "bốn mươi hai"
formatter.asNumberShort(5000000)     // "5,0 Trieu"
```

```typescript
// Works in backend services too
import { formatter } from "@wikytam/helpers"

formatter.asDuration(5400)            // "1 giờ, 30 phút"
formatter.asRelativeTime(createdAt)   // "2 ngày trước"
```

One `configureFormatter()` call at startup, then `formatter` works everywhere.

### Override for a specific page

When one page needs different settings, create a local instance:

```typescript
import { Formatter } from "@wikytam/helpers"

// Local instance with different settings - does not affect the global singleton
const exportFormatter = new Formatter({
  locale: "en-US",
  currencyCode: "USD",
})

export function ExportPage() {
  return <span>{exportFormatter.asCurrency(1234.56)}</span> // "$1,234.56"
}
```



## Configuration

All options are optional with sensible defaults:

```typescript
const f = new Formatter({
  locale: "vi-VN",                          // Intl locale (default: "en-US")
  timeZone: "Asia/Ho_Chi_Minh",             // Output timezone (default: "UTC")
  defaultTimeZone: "UTC",                   // Assumed TZ for inputs without timezone
  dateFormat: "medium",                     // Default date format preset or Intl options
  timeFormat: "medium",                     // Default time format preset or Intl options
  datetimeFormat: "medium",                 // Default datetime format preset or Intl options
  booleanFormat: ["No", "Yes"],             // [falsy, truthy] labels
  nullDisplay: "(not set)",                 // Shown for null/undefined values
  currencyCode: "VND",                      // ISO 4217 currency code
  decimalSeparator: ",",                    // Custom decimal separator (null = locale default)
  thousandSeparator: ".",                   // Custom thousand separator (null = locale default)
  currencyDecimalSeparator: null,           // Custom decimal for currency (null = locale default)
  sizeFormatBase: 1024,                     // 1024 (binary) or 1000 (decimal)
  systemOfUnits: "metric",                  // "metric" or "imperial"
  defaultDecimalDigits: null,               // Default fraction digits (null = auto per method)
})
```



### Date Format Presets

The `dateFormat`, `timeFormat`, and `datetimeFormat` options accept either a preset string or an `Intl.DateTimeFormatOptions` object:

| Preset     | Date Example         | Time Example     |
| ---------- | -------------------- | ---------------- |
| `"short"`  | `3/15/24`            | `2:30 PM`        |
| `"medium"` | `Mar 15, 2024`       | `2:30:45 PM`     |
| `"long"`   | `March 15, 2024`     | `2:30:45 PM UTC` |
| `"full"`   | `Friday, March 15..` | `2:30:45 PM ..`  |



## Generic `format()` Method

Like Yii2, you can dispatch dynamically by format name:

```typescript
f.format(value, "date")              // calls asDate(value)
f.format(value, "integer")           // calls asInteger(value)
f.format(value, ["decimal", 3])      // calls asDecimal(value, 3)
f.format(value, ["currency", "EUR"]) // calls asCurrency(value, "EUR")
f.format(null, "text")               // returns nullDisplay
```



## API Reference



### String & HTML

| Method           | Description                                                  | Signature                           |
| ---------------- | ------------------------------------------------------------ | ----------------------------------- |
| `asRaw()`        | Returns the value as-is without any formatting.              | `asRaw(value)`                      |
| `asText()`       | HTML-encodes the value as plain text.                        | `asText(value)`                     |
| `asNtext()`      | HTML-encodes with newlines (`\n`, `\r\n`, `\r`) as `<br />`.| `asNtext(value)`                    |
| `asParagraphs()` | Splits by double newlines into paragraphs.                   | `asParagraphs(value, options?)`     |
| `asHtml()`       | Returns HTML, optionally sanitized via allowlist.            | `asHtml(value, sanitize?)`          |
| `asEmail()`      | Creates a mailto link with optional subject/body.            | `asEmail(value, options?)`          |
| `asUrl()`        | Creates a hyperlink with rel, class, text options.           | `asUrl(value, options?)`            |
| `asImage()`      | Creates an `<img>` tag with width/height/class/loading.      | `asImage(value, options?)`          |
| `asBoolean()`    | Formats as boolean using configured labels.                  | `asBoolean(value)`                  |

```typescript
// Basic formatting
f.asRaw("<b>hello</b>")     // "<b>hello</b>"
f.asText("<b>hello</b>")    // "&lt;b&gt;hello&lt;/b&gt;"
f.asNtext("a\nb")           // "a<br />b"
f.asNtext("a\r\nb")         // "a<br />b"  (Windows line endings)
f.asNtext("a\n\nb")         // "a<br /><br />b"  (consecutive newlines preserved)
f.asParagraphs("p1\n\np2")  // "<p>p1</p>\n<p>p2</p>"
f.asBoolean(true)           // "Yes"

// asParagraphs options
f.asParagraphs("A\n\nB", { tag: "div" })          // "<div>A</div>\n<div>B</div>"
f.asParagraphs("a\nb\n\nc", { lineBreaks: true })  // "<p>a<br />b</p>\n<p>c</p>"

// asHtml with sanitizer
f.asHtml("<p>safe</p>")     // "<p>safe</p>"  (no sanitize config = pass-through)
f.asHtml('<p>ok</p><script>bad</script>', {
  allowedTags: ["p", "b", "i"],
})                           // '<p>ok</p>bad'
f.asHtml('<a href="x" onclick="evil()">Link</a>', {
  allowedTags: ["a"],
  allowedAttributes: { a: ["href"] },
})                           // '<a href="x">Link</a>'

// asEmail options
f.asEmail("a@b.com")                              // '<a href="mailto:a@b.com">a@b.com</a>'
f.asEmail("a@b.com", { text: "Contact us" })       // '<a href="mailto:a@b.com">Contact us</a>'
f.asEmail("a@b.com", { subject: "Hi", body: "Hello" })
                                                   // '<a href="mailto:a@b.com?subject=Hi&body=Hello">a@b.com</a>'
f.asEmail("invalid-email")                         // "invalid-email" (plain text for invalid)

// asUrl options
f.asUrl("example.com")                             // '<a href="http://example.com" target="_blank">example.com</a>'
f.asUrl("ftp://files.example.com")                 // detects ftp:// scheme
f.asUrl("https://x.com", { text: "Visit", rel: "noopener", class: "link" })
                                                   // '<a href="https://x.com" target="_blank" rel="noopener" class="link">Visit</a>'

// asImage options
f.asImage("/pic.jpg")                              // '<img src="/pic.jpg" alt="" />'
f.asImage("/pic.jpg", { alt: "Photo", width: 200, height: 150 })
                                                   // '<img src="/pic.jpg" alt="Photo" width="200" height="150" />'
f.asImage("/pic.jpg", { class: "rounded", loading: "lazy" })
                                                   // '<img src="/pic.jpg" alt="" class="rounded" loading="lazy" />'
```

#### Option Types

```typescript
interface EmailOptions {
  text?: string      // Custom display text
  subject?: string   // Email subject
  body?: string      // Email body
}

interface UrlOptions {
  target?: string    // Link target (default: "_blank")
  text?: string      // Custom display text
  rel?: string       // Rel attribute
  class?: string     // CSS class(es)
}

interface ImageOptions {
  alt?: string               // Alt text
  width?: number | string    // Width
  height?: number | string   // Height
  class?: string             // CSS class(es)
  loading?: "lazy" | "eager" // Loading strategy
}

interface ParagraphOptions {
  tag?: string       // Wrapper tag (default: "p")
  lineBreaks?: boolean // Convert \n to <br /> within paragraphs (default: false)
}

interface HtmlSanitizeConfig {
  allowedTags?: string[]                       // Allowed HTML tags
  allowedAttributes?: Record<string, string[]> // Allowed attributes per tag
}
```



### Number & Currency

| Method           | Description                                        | Signature                        |
| ---------------- | -------------------------------------------------- | -------------------------------- |
| `asInteger()`    | Formats as integer (truncates, no rounding).       | `asInteger(value)`               |
| `asDecimal()`    | Formats as decimal number.                         | `asDecimal(value, decimals?)`    |
| `asPercent()`    | Formats as percent with "%" sign.                  | `asPercent(value, decimals?)`    |
| `asCurrency()`   | Formats as currency using ISO 4217 codes.          | `asCurrency(value, currency?)`   |
| `asScientific()` | Formats as scientific notation (e-notation).       | `asScientific(value, decimals?)` |
| `asSpellout()`   | Spells out a number in words.                      | `asSpellout(value)`              |
| `asOrdinal()`    | Formats as ordinal (e.g. "1st", "2nd").            | `asOrdinal(value)`               |

```typescript
f.asInteger(1234.99)         // "1,234"
f.asDecimal(1234.5)          // "1,234.50"
f.asDecimal(1234.5, 3)       // "1,234.500"
f.asPercent(0.156, 1)        // "15.6%"
f.asCurrency(1234.56)        // "$1,234.56"
f.asCurrency(1234, "EUR")    // "EUR 1,234.00" (varies by locale)
f.asScientific(1234567)      // "1.23E6"
f.asSpellout(42)             // "forty-two"
f.asOrdinal(3)               // "3rd"
```

#### Ordinal Locale Support

Built-in ordinal suffixes for: `en`, `vi`, `fr`, `de`, `es`, `pt`, `it`, `ja`, `ko`, `zh`.

Add custom ordinal suffixes at runtime:

```typescript
Formatter.registerOrdinalSuffixes("nl", { other: "e" })

const fNl = new Formatter({ locale: "nl-NL" })
fNl.asOrdinal(1)  // "1e"
fNl.asOrdinal(5)  // "5e"
```



### Date & Time

| Method             | Description                                   | Signature                               |
| ------------------ | --------------------------------------------- | --------------------------------------- |
| `asDate()`         | Formats as date.                              | `asDate(value, format?)`                |
| `asTime()`         | Formats as time.                              | `asTime(value, format?)`                |
| `asDatetime()`     | Formats as datetime.                          | `asDatetime(value, format?)`            |
| `asTimestamp()`    | Converts to UNIX timestamp (seconds).         | `asTimestamp(value)`                    |
| `asRelativeTime()` | Human-readable time interval from now.        | `asRelativeTime(value, referenceTime?)` |
| `asDuration()`     | Human-readable duration.                      | `asDuration(value, implode?)`           |

```typescript
f.asDate("2024-03-15")                    // "Mar 15, 2024"
f.asDate("2024-03-15", "long")            // "March 15, 2024"
f.asDate("2024-03-15", { year: "numeric", month: "2-digit", day: "2-digit" })
                                           // "03/15/2024"
f.asTime(date)                             // "2:30:45 PM"
f.asDatetime(date)                         // "Mar 15, 2024, 2:30:45 PM"
f.asTimestamp("2024-03-15T14:30:45.000Z")  // "1710513045"
f.asRelativeTime(twoDaysAgo)               // "2 days ago"
f.asRelativeTime(date, referenceDate)      // "in 2 hours"
f.asDuration(5400)                         // "1 hour, 30 minutes"
f.asDuration(90061)                        // "1 day, 1 hour, 1 minute, 1 second"

// UNIX timestamps are auto-detected and converted
f.asDate(1710513045)                       // "Mar 15, 2024" (seconds -> auto-convert)
f.asDate(1710513045000)                    // "Mar 15, 2024" (milliseconds -> auto-convert)
f.asDatetime(1710513045)                   // "Mar 15, 2024, 2:30:45 PM"
```

Date inputs accept: `Date` objects, UNIX timestamps (seconds or milliseconds - auto-detected), ISO 8601 strings.
Numbers below `1e12` are treated as seconds, above as milliseconds.

### Size & Measurement

| Method            | Description                                              | Signature                         |
| ----------------- | -------------------------------------------------------- | --------------------------------- |
| `asSize()`        | Formats bytes as size (e.g. `12 kilobytes`).             | `asSize(value, decimals?)`        |
| `asShortSize()`   | Formats bytes as short size (e.g. `12 kB`).              | `asShortSize(value, decimals?)`   |
| `asLength()`      | Formats length (e.g. `12 meters`).                       | `asLength(value, decimals?)`      |
| `asShortLength()` | Formats short length (e.g. `12 m`).                      | `asShortLength(value, decimals?)` |
| `asWeight()`      | Formats weight (e.g. `12 kilograms`).                    | `asWeight(value, decimals?)`      |
| `asShortWeight()` | Formats short weight (e.g. `12 kg`).                     | `asShortWeight(value, decimals?)` |

```typescript
// File sizes (base 1024 by default)
f.asSize(1536)            // "1.5 kilobytes"
f.asShortSize(1048576)    // "1 MB"
f.asShortSize(1073741824) // "1 GB"

// Metric lengths (default)
f.asLength(1500)          // "1.5 meters"
f.asShortLength(5000000)  // "5 km"

// Metric weights (default)
f.asWeight(1500)          // "1.5 kilograms"
f.asShortWeight(5000000)  // "5 t"

// Imperial system
const fImp = new Formatter({ systemOfUnits: "imperial" })
fImp.asLength(24)         // "2 feet"
fImp.asWeight(14000)      // "2 pounds"

// Decimal base for file sizes
const f1000 = new Formatter({ sizeFormatBase: 1000 })
f1000.asShortSize(1500)   // "1.5 KB"
```



### Utility Methods

| Method               | Description                                       | Signature                                          |
| -------------------- | ------------------------------------------------- | -------------------------------------------------- |
| `asNumberShort()`    | Abbreviates large numbers with locale suffixes.   | `asNumberShort(value, options?)`                   |
| `asGpsDistance()`    | Formatted distance between GPS coordinates.       | `asGpsDistance(lat1, lon1, lat2, lon2, options?)`  |
| `asMaskedValue()`   | Masks a string, showing first/last N characters.  | `asMaskedValue(value, options?)`                   |

```typescript
// Abbreviate large numbers
f.asNumberShort(1_500_000)                          // "1.5 Million"
f.asNumberShort(2_300_000_000)                      // "2.3 Billion"
f.asNumberShort(999)                                // "$999.00" (falls back to currency)
f.asNumberShort(42_000, { spaceBefore: true })      // "42.0 K"
f.asNumberShort(500, { fallback: "decimal" })       // "500.0"
f.asNumberShort(500, { fallback: "integer" })       // "500"
f.asNumberShort(1_234_567, { decimals: 2 })         // "1.23 Million"

const fVi = new Formatter({ locale: "vi-VN", currencyCode: "VND" })
fVi.asNumberShort(5_000_000)                        // "5,0 Trieu"
fVi.asNumberShort(1_500_000_000_000)                // "1,5 Nghin Ty"

// GPS distance (formatted with units)
f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437)              // "3,944.4 km" (auto)
f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437, { unit: "mi" }) // "2,450.8 mi"
f.asGpsDistance(10, 20, 10.001, 20)                                   // "111.2 m" (auto: short distance)
f.asGpsDistance(10, 20, 11, 20, { unit: "km", decimals: 3 })         // "111.195 km"

// Mask sensitive data
f.asMaskedValue("0901234567")                                // "0901XXX567"
f.asMaskedValue("4111111111111111", { startVisible: 4, endVisible: 4 })  // "4111XXXXXXXX1111"
f.asMaskedValue("secret", { startVisible: 2, endVisible: 2, maskChar: "*" })  // "se**et"
f.asMaskedValue(null)                                        // "(not set)"
```

#### Option Types

```typescript
interface NumberShortOptions {
  decimals?: number      // Decimal places (default: 1)
  fallback?: "currency" | "decimal" | "integer"  // Below threshold (default: "currency")
  spaceBefore?: boolean  // Space between number and suffix (default: false)
}

interface GpsDistanceOptions {
  unit?: "m" | "km" | "mi" | "auto"  // Output unit (default: "auto")
  decimals?: number                   // Decimal places (default: 1)
  earthRadius?: number                // Earth radius in meters (default: 6371000)
}

interface MaskOptions {
  startVisible?: number  // Visible chars at start (default: 4)
  endVisible?: number    // Visible chars at end (default: 3)
  maskChar?: string      // Mask character (default: "X")
}
```



## Null Handling

All methods return `nullDisplay` when the value is `null` or `undefined`:

```typescript
const f = new Formatter({ nullDisplay: "N/A" })
f.asText(null)      // "N/A"
f.asInteger(null)   // "N/A"
f.asDate(undefined) // "N/A"
```



## Multi-locale Examples

```typescript
// Vietnamese
const fVi = new Formatter({
  locale: "vi-VN",
  timeZone: "Asia/Ho_Chi_Minh",
  currencyCode: "VND",
  booleanFormat: ["Khong", "Co"],
})
fVi.asCurrency(1234567)  // "1.234.567 d"

// Japanese
const fJa = new Formatter({
  locale: "ja-JP",
  timeZone: "Asia/Tokyo",
  currencyCode: "JPY",
})
fJa.asCurrency(1234)  // "Y1,234"
```



## Multi-locale Spellout

The `asSpellout()` method supports multiple languages via a pluggable locale registry:

```typescript
// English (built-in)
const fEn = new Formatter({ locale: "en-US" })
fEn.asSpellout(42)       // "forty-two"
fEn.asSpellout(1234567)  // "one million two hundred thirty-four thousand five hundred sixty-seven"

// Vietnamese (built-in)
const fVi = new Formatter({ locale: "vi-VN" })
fVi.asSpellout(42)       // "bon muoi hai"
fVi.asSpellout(1500)     // "mot nghin nam tram"
fVi.asSpellout(1000000)  // "mot trieu"
```



### Adding a Custom Locale

```typescript
import { registerSpellout, registerNumberShort } from "@wikytam/helpers"
import type { LocaleSpellout, NumberShortConfig } from "@wikytam/helpers"

const jaSpellout: LocaleSpellout = {
  zeroWord: "zero",
  pointWord: "ten",
  negativePrefix: "mainasu",
  integerToWords: (n) => { /* ... */ },
  digitToWord: (d) => { /* ... */ },
}

registerSpellout("ja", jaSpellout)

// Now Formatter with locale "ja-JP" will use your implementation
```



### Locale Directory Structure

```
src/locales/
  types.ts   - LocaleSpellout / NumberShortConfig interfaces
  en.ts      - English spellout + number-short
  vi.ts      - Vietnamese spellout + number-short
  index.ts   - Registry with getSpellout(), registerSpellout(), etc.
```



## Build

```bash
pnpm build      # Build ESM + CJS via tsdown
pnpm test       # Run unit tests
pnpm type-check # TypeScript type checking
```



## Exported Utilities

In addition to the `Formatter` class, the package exports helper functions:

```typescript
import { escapeHtml, normalizeDate, normalizeNumber } from "@wikytam/helpers"

escapeHtml('<script>')          // "&lt;script&gt;"
normalizeDate(1710513045)       // Date object
normalizeNumber("1,234.56")     // 1234.56
```

```typescript
import { registerSpellout, registerNumberShort, getSpellout } from "@wikytam/helpers"

// Register runtime locale, get locale provider
registerSpellout("ja", myJaSpellout)
const sp = getSpellout("ja")
```



## Differences from Yii2

| Feature               | Yii2               | This Package                                   |
| --------------------- | ------------------- | ---------------------------------------------- |
| Dependencies          | PHP intl extension  | Built-in Intl API (zero deps)                  |
| `asSpellout()`        | ICU spellout        | Locale registry (en + vi built-in, extensible) |
| `asHtml()`            | HTMLPurifier        | Built-in allowlist sanitizer + pass-through     |
| `asNtext()`           | Basic newlines      | Handles `\r\n`, `\r`, `\n` + consecutive       |
| `asParagraphs()`      | Fixed `<p>` tag     | Configurable tag + inline `<br />` option       |
| `asEmail()`           | Basic mailto        | Subject, body, text, email validation           |
| `asUrl()`             | Basic href          | rel, class, text, ftp/mailto scheme detection   |
| `asImage()`           | Basic img           | width, height, class, loading attributes        |
| `asOrdinal()`         | ICU ordinal         | 10 built-in locales + runtime registration      |
| Date formats          | ICU patterns        | Intl presets or `Intl.DateTimeFormatOptions`    |
| Config                | PHP array           | TypeScript `FormatterOptions` interface         |
| `asNumberShort()`     | Custom Yii2 helper  | Instance method + options (fallback, spaceBefore)|
| `asGpsDistance()`     | Custom Yii2 helper  | Instance method + unit/decimals options          |
| `asMaskedValue()`     | Custom Yii2 helper  | Instance method + null handling + options        |
| Date inputs           | Only Date/string    | Auto-detects UNIX timestamps (s or ms)           |
