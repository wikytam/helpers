# @wikytam/helpers

Thư viện tiện ích TypeScript được chuyển đổi từ [yii\i18n\Formatter](https://www.yiiframework.com/doc/api/2.0/yii-i18n-formatter) và các hàm helper phổ biến của Yii2, **không phụ thuộc thư viện bên ngoài** - chỉ sử dụng `Intl` API có sẵn.

| | Kích thước |
|---|---|
| ESM | 35.2 kB (9.5 kB gzip) |
| CJS | 35.5 kB (9.6 kB gzip) |
| Types | 16.0 kB |

## Cài đặt

```bash
npm install @wikytam/helpers
# hoặc
pnpm add @wikytam/helpers
# hoặc
yarn add @wikytam/helpers
```

```typescript
import { Formatter } from "@wikytam/helpers"
```

## Bắt đầu nhanh

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



## Singleton toàn cục (cấu hình một lần, dùng mọi nơi)

Package cung cấp sẵn một instance `formatter` toàn cục. Bạn chỉ cần gọi `configureFormatter()` **một lần duy nhất** khi khởi động ứng dụng, sau đó import `formatter` ở bất kỳ file nào - không cần thiết lập thêm gì.

### Bước 1: Cấu hình một lần tại điểm khởi động ứng dụng

```typescript
// 1. Gọi ở file khởi động ứng dụng (main.tsx hoặc main.ts)
//    Chỉ cần gọi MỘT LẦN DUY NHẤT, formatter sẽ tự động áp dụng
//    cho toàn bộ ứng dụng (cả frontend lẫn backend)

// apps/frontend/src/main.tsx (frontend)
// hoặc apps/backend/src/main.ts (backend)
import { configureFormatter } from "@wikytam/helpers"

configureFormatter({
  locale: "vi-VN",                        // Ngôn ngữ hiển thị
  timeZone: "Asia/Ho_Chi_Minh",           // Múi giờ đầu ra
  currencyCode: "VND",                    // Mã tiền tệ ISO 4217
  booleanFormat: ["Không", "Có"],         // Nhãn cho giá trị đúng/sai
  nullDisplay: "(chưa đặt)",              // Hiển thị khi giá trị null/undefined
  decimalSeparator: ",",                  // Dấu phân cách thập phân
  thousandSeparator: ".",                 // Dấu phân cách hàng nghìn
})
```

### Bước 2: Sử dụng ở bất kỳ đâu - chỉ cần import `formatter`

```typescript
// 2. Bất kỳ trang/component/service nào - chỉ cần import và dùng
//    Không cần truyền instance, không cần tạo file riêng
//    formatter đã được cấu hình sẵn từ bước 1

// Ví dụ: Trang danh sách đối tác
// pages/partners/PartnersList.tsx
import { formatter } from "@wikytam/helpers"

formatter.asCurrency(1234567)        // "1.234.567 ₫"
formatter.asDate("2024-03-15")       // "15 thg 3, 2024"
formatter.asBoolean(true)            // "Có"
formatter.asSpellout(42)             // "bốn mươi hai"
formatter.asNumberShort(5000000)     // "5,0 Triệu"
```

```typescript
// Ví dụ: Trang chi tiết hợp đồng
// pages/contracts/ContractDetail.tsx
import { formatter } from "@wikytam/helpers"

formatter.asDuration(5400)            // "1 giờ, 30 phút"
formatter.asRelativeTime(createdAt)   // "2 ngày trước"
```

```typescript
// Ví dụ: Service phía backend
// services/export.service.ts
import { formatter } from "@wikytam/helpers"

const label = formatter.asCurrency(amount)  // "1.234.567 ₫"
```

Không cần tạo file riêng, không cần truyền instance qua props hay context.
Chỉ cần gọi `configureFormatter()` một lần ở đầu ứng dụng, sau đó `formatter` hoạt động ở mọi nơi.

### Ghi đè cấu hình cho một trang cụ thể

Khi một trang cần cấu hình khác (ví dụ: trang xuất báo cáo tiếng Anh), chỉ cần tạo instance riêng:

```typescript
// Ví dụ: Trang xuất báo cáo cần hiển thị tiếng Anh + USD
// pages/reports/ExportPage.tsx
import { Formatter } from "@wikytam/helpers"

// Tạo instance riêng với cấu hình khác, không ảnh hưởng đến formatter toàn cục
const exportFormatter = new Formatter({
  locale: "en-US",
  currencyCode: "USD",
})

export function ExportPage() {
  return <span>{exportFormatter.asCurrency(1234.56)}</span> // "$1,234.56"
}
```



## Cấu hình

Tất cả các tùy chọn đều không bắt buộc, có giá trị mặc định hợp lý:

```typescript
const f = new Formatter({
  locale: "vi-VN",                          // Ngôn ngữ Intl (mặc định: "en-US")
  timeZone: "Asia/Ho_Chi_Minh",             // Múi giờ đầu ra (mặc định: "UTC")
  defaultTimeZone: "UTC",                   // Múi giờ mặc định cho đầu vào không có timezone
  dateFormat: "medium",                     // Định dạng ngày mặc định (preset hoặc Intl options)
  timeFormat: "medium",                     // Định dạng giờ mặc định (preset hoặc Intl options)
  datetimeFormat: "medium",                 // Định dạng ngày giờ mặc định (preset hoặc Intl options)
  booleanFormat: ["Không", "Có"],           // [giá trị sai, giá trị đúng]
  nullDisplay: "(chưa đặt)",               // Hiển thị khi giá trị null/undefined
  currencyCode: "VND",                      // Mã tiền tệ ISO 4217
  decimalSeparator: ",",                    // Dấu phân cách thập phân (null = theo ngôn ngữ)
  thousandSeparator: ".",                   // Dấu phân cách hàng nghìn (null = theo ngôn ngữ)
  currencyDecimalSeparator: null,           // Dấu thập phân cho tiền tệ (null = theo ngôn ngữ)
  sizeFormatBase: 1024,                     // 1024 (nhị phân) hoặc 1000 (thập phân)
  systemOfUnits: "metric",                  // "metric" (mét) hoặc "imperial" (Anh/Mỹ)
  defaultDecimalDigits: null,               // Số chữ số thập phân mặc định (null = tự động)
})
```



### Định dạng ngày theo preset

Các tùy chọn `dateFormat`, `timeFormat`, `datetimeFormat` chấp nhận chuỗi preset hoặc đối tượng `Intl.DateTimeFormatOptions`:

| Preset     | Ví dụ ngày           | Ví dụ giờ        |
| ---------- | -------------------- | ---------------- |
| `"short"`  | `3/15/24`            | `2:30 PM`        |
| `"medium"` | `Mar 15, 2024`       | `2:30:45 PM`     |
| `"long"`   | `March 15, 2024`     | `2:30:45 PM UTC` |
| `"full"`   | `Friday, March 15..` | `2:30:45 PM ..`  |



## Phương thức `format()` tổng quát

Giống Yii2, bạn có thể gọi linh hoạt theo tên định dạng:

```typescript
f.format(value, "date")              // gọi asDate(value)
f.format(value, "integer")           // gọi asInteger(value)
f.format(value, ["decimal", 3])      // gọi asDecimal(value, 3)
f.format(value, ["currency", "EUR"]) // gọi asCurrency(value, "EUR")
f.format(null, "text")               // trả về nullDisplay
```



## Tham chiếu API



### Chuỗi & HTML

| Phương thức      | Mô tả                                                                                | Chữ ký                          |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| `asRaw()`        | Trả về giá trị nguyên bản, không định dạng gì.                                       | `asRaw(value)`                  |
| `asText()`       | Mã hóa HTML rồi trả về dạng văn bản thuần.                                           | `asText(value)`                 |
| `asNtext()`      | Mã hóa HTML, chuyển `\n`, `\r\n`, `\r` thành `<br />`.                               | `asNtext(value)`                |
| `asParagraphs()` | Tách đoạn văn bằng dòng trống kép. Hỗ trợ tùy chọn tag wrapper và `<br />`.          | `asParagraphs(value, options?)` |
| `asHtml()`       | Trả về HTML, tùy chọn lọc (sanitize) theo danh sách trắng.                           | `asHtml(value, sanitize?)`      |
| `asEmail()`      | Tạo liên kết mailto. Hỗ trợ subject, body, text tùy chỉnh. Validate email.           | `asEmail(value, options?)`      |
| `asUrl()`        | Tạo siêu liên kết. Nhận diện ftp://, mailto:. Hỗ trợ rel, class, text.               | `asUrl(value, options?)`        |
| `asImage()`      | Tạo thẻ `<img>`. Hỗ trợ width, height, class, loading.                               | `asImage(value, options?)`      |
| `asBoolean()`    | Định dạng thành nhãn đúng/sai theo cấu hình.                                         | `asBoolean(value)`              |

```typescript
// Định dạng cơ bản
f.asRaw("<b>hello</b>")     // "<b>hello</b>"
f.asText("<b>hello</b>")    // "&lt;b&gt;hello&lt;/b&gt;"
f.asNtext("a\nb")           // "a<br />b"
f.asNtext("a\r\nb")         // "a<br />b"  (hỗ trợ Windows \r\n)
f.asNtext("a\n\nb")         // "a<br /><br />b"  (giữ dòng trống liên tiếp)
f.asBoolean(true)           // "Yes"

// asParagraphs tùy chọn
f.asParagraphs("p1\n\np2")                         // "<p>p1</p>\n<p>p2</p>"
f.asParagraphs("A\n\nB", { tag: "div" })           // "<div>A</div>\n<div>B</div>"
f.asParagraphs("a\nb\n\nc", { lineBreaks: true })  // "<p>a<br />b</p>\n<p>c</p>"

// asHtml với trình lọc HTML
f.asHtml("<p>safe</p>")     // "<p>safe</p>"  (không lọc nếu không truyền config)
f.asHtml('<p>ok</p><script>bad</script>', {
  allowedTags: ["p", "b", "i"],
})                           // '<p>ok</p>bad'

// asEmail tùy chọn
f.asEmail("a@b.com")                              // '<a href="mailto:a@b.com">a@b.com</a>'
f.asEmail("a@b.com", { text: "Liên hệ" })         // '<a href="mailto:a@b.com">Liên hệ</a>'
f.asEmail("a@b.com", { subject: "Xin chào" })     // '<a href="mailto:a@b.com?subject=Xin%20ch%C3%A0o">a@b.com</a>'
f.asEmail("email-sai")                             // "email-sai" (trả về văn bản thuần nếu không hợp lệ)

// asUrl tùy chọn
f.asUrl("example.com")                             // '<a href="http://example.com" target="_blank">example.com</a>'
f.asUrl("ftp://files.example.com")                 // nhận diện ftp://
f.asUrl("https://x.com", { text: "Truy cập", rel: "noopener", class: "link" })

// asImage tùy chọn
f.asImage("/pic.jpg")                              // '<img src="/pic.jpg" alt="" />'
f.asImage("/pic.jpg", { alt: "Ảnh", width: 200, height: 150, loading: "lazy" })
```



### Số & Tiền tệ

| Phương thức      | Mô tả                                                                                  | Chữ ký                           |
| ---------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| `asInteger()`    | Định dạng thành số nguyên, bỏ phần thập phân (không làm tròn).                         | `asInteger(value)`               |
| `asDecimal()`    | Định dạng thành số thập phân.                                                           | `asDecimal(value, decimals?)`    |
| `asPercent()`    | Định dạng thành phần trăm có ký hiệu "%".                                              | `asPercent(value, decimals?)`    |
| `asCurrency()`   | Định dạng thành tiền tệ theo mã ISO 4217.                                              | `asCurrency(value, currency?)`   |
| `asScientific()` | Định dạng thành ký hiệu khoa học (e-notation).                                         | `asScientific(value, decimals?)` |
| `asSpellout()`   | Đọc số thành chữ (ví dụ: 42 → "forty-two").                                            | `asSpellout(value)`              |
| `asOrdinal()`    | Định dạng thành số thứ tự (ví dụ: 1 → "1st").                                          | `asOrdinal(value)`               |

```typescript
f.asInteger(1234.99)         // "1,234"
f.asDecimal(1234.5)          // "1,234.50"
f.asDecimal(1234.5, 3)       // "1,234.500"
f.asPercent(0.156, 1)        // "15.6%"
f.asCurrency(1234.56)        // "$1,234.56"
f.asCurrency(1234, "EUR")    // "EUR 1,234.00" (tùy theo ngôn ngữ)
f.asScientific(1234567)      // "1.23E6"
f.asSpellout(42)             // "forty-two"
f.asOrdinal(3)               // "3rd"
```

#### Hỗ trợ ordinal đa ngôn ngữ

Hậu tố thứ tự có sẵn cho: `en`, `vi`, `fr`, `de`, `es`, `pt`, `it`, `ja`, `ko`, `zh`.

Thêm hậu tố tùy chỉnh lúc chạy:

```typescript
Formatter.registerOrdinalSuffixes("nl", { other: "e" })

const fNl = new Formatter({ locale: "nl-NL" })
fNl.asOrdinal(1)  // "1e"
```



### Ngày & Giờ

| Phương thức        | Mô tả                                                                                    | Chữ ký                                  |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| `asDate()`         | Định dạng thành ngày.                                                                     | `asDate(value, format?)`                |
| `asTime()`         | Định dạng thành giờ.                                                                      | `asTime(value, format?)`                |
| `asDatetime()`     | Định dạng thành ngày giờ.                                                                 | `asDatetime(value, format?)`            |
| `asTimestamp()`    | Chuyển đổi thành UNIX timestamp (số giây kể từ 01-01-1970).                              | `asTimestamp(value)`                    |
| `asRelativeTime()` | Hiển thị khoảng cách thời gian so với hiện tại dưới dạng dễ đọc.                         | `asRelativeTime(value, referenceTime?)` |
| `asDuration()`     | Hiển thị thời lượng dưới dạng dễ đọc (giờ, phút, giây).                                  | `asDuration(value, implode?)`           |

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
```

Đầu vào ngày chấp nhận: đối tượng `Date`, UNIX timestamp (giây hoặc mili giây), chuỗi ISO 8601.

### Kích thước & Đo lường

| Phương thức       | Mô tả                                                                    | Chữ ký                            |
| ----------------- | ------------------------------------------------------------------------- | --------------------------------- |
| `asSize()`        | Định dạng byte thành dạng dễ đọc, ví dụ `12 kilobytes`.                  | `asSize(value, decimals?)`        |
| `asShortSize()`   | Định dạng byte thành dạng rút gọn, ví dụ `12 kB`.                        | `asShortSize(value, decimals?)`   |
| `asLength()`      | Định dạng độ dài dạng đầy đủ, ví dụ `12 meters`.                         | `asLength(value, decimals?)`      |
| `asShortLength()` | Định dạng độ dài dạng rút gọn, ví dụ `12 m`.                             | `asShortLength(value, decimals?)` |
| `asWeight()`      | Định dạng trọng lượng dạng đầy đủ, ví dụ `12 kilograms`.                 | `asWeight(value, decimals?)`      |
| `asShortWeight()` | Định dạng trọng lượng dạng rút gọn, ví dụ `12 kg`.                       | `asShortWeight(value, decimals?)` |

```typescript
// Kích thước file (cơ số 1024 mặc định)
f.asSize(1536)            // "1.5 kilobytes"
f.asShortSize(1048576)    // "1 MB"
f.asShortSize(1073741824) // "1 GB"

// Độ dài hệ mét (mặc định)
f.asLength(1500)          // "1.5 meters"
f.asShortLength(5000000)  // "5 km"

// Trọng lượng hệ mét (mặc định)
f.asWeight(1500)          // "1.5 kilograms"
f.asShortWeight(5000000)  // "5 t"

// Hệ đo Anh/Mỹ (imperial)
const fImp = new Formatter({ systemOfUnits: "imperial" })
fImp.asLength(24)         // "2 feet"
fImp.asWeight(14000)      // "2 pounds"

// Cơ số thập phân cho kích thước file
const f1000 = new Formatter({ sizeFormatBase: 1000 })
f1000.asShortSize(1500)   // "1.5 KB"
```



### Phương thức tiện ích

| Phương thức          | Mô tả                                                                                  | Chữ ký                                         |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `asNumberShort()`    | Viết tắt số lớn kèm hậu tố theo ngôn ngữ (ví dụ: "1,5 Triệu", "2,3 Tỷ").            | `asNumberShort(value, options?)`               |
| `asGpsDistance()`    | Khoảng cách GPS được định dạng kèm đơn vị (km, m, mi).                                 | `asGpsDistance(lat1, lon1, lat2, lon2, options?)`|
| `asMaskedValue()`    | Che giấu chuỗi, chỉ hiển thị N ký tự đầu và cuối.                                     | `asMaskedValue(value, options?)`               |

```typescript
// Viết tắt số lớn
f.asNumberShort(1_500_000)                           // "1.5 Million"
f.asNumberShort(42_000, { spaceBefore: true })       // "42.0 K"
f.asNumberShort(500, { fallback: "decimal" })        // "500.0"
f.asNumberShort(500, { fallback: "integer" })        // "500"
f.asNumberShort(1_234_567, { decimals: 2 })          // "1.23 Million"

const fVi = new Formatter({ locale: "vi-VN", currencyCode: "VND" })
fVi.asNumberShort(5_000_000)                         // "5,0 Triệu"
fVi.asNumberShort(1_500_000_000_000)                 // "1,5 Nghìn Tỷ"

// Khoảng cách GPS (có đơn vị)
f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437)                 // "3,944.4 km" (tự động)
f.asGpsDistance(40.7128, -74.006, 34.0522, -118.2437, { unit: "mi" }) // "2,450.8 mi"
f.asGpsDistance(10, 20, 10.001, 20)                                    // "111.2 m" (khoảng cách ngắn)

// Che giấu dữ liệu nhạy cảm
f.asMaskedValue("0901234567")                                // "0901XXX567"
f.asMaskedValue("4111111111111111", { startVisible: 4, endVisible: 4 })  // "4111XXXXXXXX1111"
f.asMaskedValue("secret", { startVisible: 2, endVisible: 2, maskChar: "*" })  // "se**et"
f.asMaskedValue(null)                                        // "(not set)"
```



## Xử lý giá trị null

Tất cả phương thức trả về `nullDisplay` khi giá trị là `null` hoặc `undefined`:

```typescript
const f = new Formatter({ nullDisplay: "Không có dữ liệu" })
f.asText(null)      // "Không có dữ liệu"
f.asInteger(null)   // "Không có dữ liệu"
f.asDate(undefined) // "Không có dữ liệu"
```



## Ví dụ đa ngôn ngữ

```typescript
// Tiếng Việt
const fVi = new Formatter({
  locale: "vi-VN",
  timeZone: "Asia/Ho_Chi_Minh",
  currencyCode: "VND",
  booleanFormat: ["Không", "Có"],
})
fVi.asCurrency(1234567)  // "1.234.567 ₫"

// Tiếng Nhật
const fJa = new Formatter({
  locale: "ja-JP",
  timeZone: "Asia/Tokyo",
  currencyCode: "JPY",
})
fJa.asCurrency(1234)  // "¥1,234"
```



## Đọc số thành chữ (Spellout) đa ngôn ngữ

Phương thức `asSpellout()` hỗ trợ nhiều ngôn ngữ thông qua hệ thống đăng ký locale:

```typescript
// Tiếng Anh (có sẵn)
const fEn = new Formatter({ locale: "en-US" })
fEn.asSpellout(42)       // "forty-two"
fEn.asSpellout(1234567)  // "one million two hundred thirty-four thousand five hundred sixty-seven"

// Tiếng Việt (có sẵn)
const fVi = new Formatter({ locale: "vi-VN" })
fVi.asSpellout(42)       // "bốn mươi hai"
fVi.asSpellout(1500)     // "một nghìn năm trăm"
fVi.asSpellout(1000000)  // "một triệu"
```



### Thêm locale tùy chỉnh

```typescript
import { registerSpellout, registerNumberShort } from "@wikytam/helpers"
import type { LocaleSpellout, NumberShortConfig } from "@wikytam/helpers"

// Ví dụ: Thêm tiếng Nhật
const jaSpellout: LocaleSpellout = {
  zeroWord: "zero",
  pointWord: "ten",
  negativePrefix: "mainasu",
  integerToWords: (n) => { /* triển khai logic đọc số tiếng Nhật */ },
  digitToWord: (d) => { /* chuyển chữ số thành chữ tiếng Nhật */ },
}

registerSpellout("ja", jaSpellout)

// Formatter với locale "ja-JP" sẽ sử dụng triển khai của bạn
```



### Cấu trúc thư mục locale

```
src/locales/
  types.ts   - Giao diện LocaleSpellout / NumberShortConfig
  en.ts      - Đọc số tiếng Anh + viết tắt số
  vi.ts      - Đọc số tiếng Việt + viết tắt số
  index.ts   - Bộ đăng ký: getSpellout(), registerSpellout(), v.v.
```



## Build

```bash
pnpm build      # Build ESM + CJS bằng tsdown
pnpm test       # Chạy unit test
pnpm type-check # Kiểm tra kiểu TypeScript
```



## Các hàm tiện ích được export

Ngoài lớp `Formatter`, package cũng export các hàm helper:

```typescript
import { escapeHtml, normalizeDate, normalizeNumber } from "@wikytam/helpers"

escapeHtml('<script>')          // "&lt;script&gt;"
normalizeDate(1710513045)       // Đối tượng Date
normalizeNumber("1,234.56")     // 1234.56
```

```typescript
import { registerSpellout, registerNumberShort, getSpellout } from "@wikytam/helpers"

// Đăng ký locale lúc chạy (runtime), lấy provider locale
registerSpellout("ja", myJaSpellout)
const sp = getSpellout("ja")
```



## Khác biệt so với Yii2

| Tính năng             | Yii2               | Package này                                      |
| --------------------- | ------------------- | ------------------------------------------------ |
| Phụ thuộc             | PHP intl extension  | Intl API có sẵn (không phụ thuộc gì)             |
| `asSpellout()`        | ICU spellout        | Hệ thống locale (en + vi có sẵn, mở rộng được)  |
| `asHtml()`            | HTMLPurifier        | Trình lọc HTML theo danh sách trắng tích hợp    |
| `asNtext()`           | Chỉ `\n`            | Hỗ trợ `\r\n`, `\r`, `\n` + dòng trống liên tiếp|
| `asParagraphs()`      | Cố định thẻ `<p>`   | Tùy chọn tag wrapper + `<br />` trong đoạn       |
| `asEmail()`           | Mailto cơ bản       | Subject, body, text, validate email               |
| `asUrl()`             | Href cơ bản         | rel, class, text, nhận diện ftp/mailto            |
| `asImage()`           | Img cơ bản          | width, height, class, loading                     |
| `asOrdinal()`         | ICU ordinal         | 10 ngôn ngữ có sẵn + đăng ký runtime             |
| Định dạng ngày        | ICU patterns        | Intl presets hoặc `Intl.DateTimeFormatOptions`    |
| Cấu hình              | Mảng PHP            | Interface TypeScript `FormatterOptions`            |
| `asNumberShort()`     | Helper Yii2 tùy chỉnh | Instance method + options (fallback, spaceBefore)|
| `asGpsDistance()`     | Helper Yii2 tùy chỉnh | Instance method + đơn vị/decimals options       |
| `asMaskedValue()`     | Helper Yii2 tùy chỉnh | Instance method + null handling + options       |
| Đầu vào ngày          | Chỉ Date/string      | Tự nhận diện UNIX timestamp (giây hoặc mili giây)|
