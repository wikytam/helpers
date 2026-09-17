import { describe, expect, it } from "vitest"
import { Formatter } from "../formatter.js"

describe("Formatter - String & HTML", () => {
	const f = new Formatter()

	describe("asRaw", () => {
		it("returns value as-is without changes", () => {
			expect(f.asRaw("<b>bold</b>")).toBe("<b>bold</b>")
			expect(f.asRaw(123)).toBe("123")
		})

		it("returns nullDisplay for null/undefined", () => {
			expect(f.asRaw(null)).toBe("(not set)")
			expect(f.asRaw(undefined)).toBe("(not set)")
		})
	})

	describe("asText", () => {
		it("escapes HTML special characters", () => {
			expect(f.asText('<script>alert("xss")</script>')).toBe(
				"&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
			)
		})

		it("escapes ampersand and quotes", () => {
			expect(f.asText("Tom & Jerry's")).toBe("Tom &amp; Jerry&#039;s")
		})

		it("returns nullDisplay for null", () => {
			expect(f.asText(null)).toBe("(not set)")
		})
	})

	// ─── asNtext ──────────────────────────────────────────────────────

	describe("asNtext", () => {
		it("converts \\n to <br /> and escapes HTML", () => {
			expect(f.asNtext("line1\nline2")).toBe("line1<br />line2")
		})

		it("escapes HTML before replacing newlines", () => {
			expect(f.asNtext("<b>bold</b>\nnew")).toBe(
				"&lt;b&gt;bold&lt;/b&gt;<br />new",
			)
		})

		it("handles Windows \\r\\n line endings", () => {
			expect(f.asNtext("line1\r\nline2")).toBe("line1<br />line2")
		})

		it("handles old Mac \\r line endings", () => {
			expect(f.asNtext("line1\rline2")).toBe("line1<br />line2")
		})

		it("handles mixed line endings", () => {
			expect(f.asNtext("a\r\nb\nc\rd")).toBe("a<br />b<br />c<br />d")
		})

		it("preserves consecutive newlines as multiple <br />", () => {
			expect(f.asNtext("a\n\nb")).toBe("a<br /><br />b")
			expect(f.asNtext("a\n\n\nb")).toBe("a<br /><br /><br />b")
		})

		it("preserves consecutive \\r\\n as multiple <br />", () => {
			expect(f.asNtext("a\r\n\r\nb")).toBe("a<br /><br />b")
		})
	})

	// ─── asParagraphs ─────────────────────────────────────────────────

	describe("asParagraphs", () => {
		it("wraps paragraphs with <p> tag by default", () => {
			expect(f.asParagraphs("Para 1\n\nPara 2")).toBe(
				"<p>Para 1</p>\n<p>Para 2</p>",
			)
		})

		it("escapes HTML in each paragraph", () => {
			expect(f.asParagraphs("<b>bold</b>\n\nnormal")).toBe(
				"<p>&lt;b&gt;bold&lt;/b&gt;</p>\n<p>normal</p>",
			)
		})

		it("skips empty paragraphs", () => {
			const result = f.asParagraphs("Only one")
			expect(result).toBe("<p>Only one</p>")
		})

		it("supports custom wrapper tag via options", () => {
			expect(f.asParagraphs("A\n\nB", { tag: "div" })).toBe(
				"<div>A</div>\n<div>B</div>",
			)
		})

		it("supports custom <section> tag", () => {
			expect(f.asParagraphs("Sec 1\n\nSec 2", { tag: "section" })).toBe(
				"<section>Sec 1</section>\n<section>Sec 2</section>",
			)
		})

		it("converts inline \\n to <br /> when lineBreaks is true", () => {
			expect(
				f.asParagraphs("line1\nline2\n\nparagraph2", { lineBreaks: true }),
			).toBe("<p>line1<br />line2</p>\n<p>paragraph2</p>")
		})

		it("does not convert inline \\n when lineBreaks is false (default)", () => {
			expect(f.asParagraphs("line1\nline2\n\nparagraph2")).toBe(
				"<p>line1\nline2</p>\n<p>paragraph2</p>",
			)
		})

		it("handles \\r\\n line endings in paragraph splitting", () => {
			expect(f.asParagraphs("A\r\n\r\nB")).toBe("<p>A</p>\n<p>B</p>")
		})

		it("combines custom tag and lineBreaks", () => {
			expect(
				f.asParagraphs("a\nb\n\nc", { tag: "div", lineBreaks: true }),
			).toBe("<div>a<br />b</div>\n<div>c</div>")
		})
	})

	// ─── asHtml ───────────────────────────────────────────────────────

	describe("asHtml", () => {
		it("returns HTML as-is without sanitize config", () => {
			expect(f.asHtml("<p>Hello <b>World</b></p>")).toBe(
				"<p>Hello <b>World</b></p>",
			)
		})

		it("strips disallowed tags when sanitize config is provided", () => {
			expect(
				f.asHtml('<p>Hello <script>alert("xss")</script></p>', {
					allowedTags: ["p"],
				}),
			).toBe('<p>Hello alert("xss")</p>')
		})

		it("allows specified tags and removes others", () => {
			expect(
				f.asHtml("<b>bold</b> <i>italic</i> <script>bad</script>", {
					allowedTags: ["b", "i"],
				}),
			).toBe("<b>bold</b> <i>italic</i> bad")
		})

		it("filters attributes based on allowedAttributes", () => {
			expect(
				f.asHtml(
					'<a href="http://example.com" onclick="evil()" class="link">Click</a>',
					{
						allowedTags: ["a"],
						allowedAttributes: { a: ["href"] },
					},
				),
			).toBe('<a href="http://example.com">Click</a>')
		})

		it("allows multiple attributes", () => {
			expect(
				f.asHtml(
					'<a href="http://example.com" target="_blank" rel="noopener">Link</a>',
					{
						allowedTags: ["a"],
						allowedAttributes: { a: ["href", "target", "rel"] },
					},
				),
			).toBe(
				'<a href="http://example.com" target="_blank" rel="noopener">Link</a>',
			)
		})

		it("handles self-closing tags", () => {
			expect(
				f.asHtml('<br /><img src="x.jpg" /><hr />', {
					allowedTags: ["br", "hr"],
				}),
			).toBe("<br /><hr />")
		})

		it("preserves text content around stripped tags", () => {
			expect(
				f.asHtml("Before <b>bold</b> middle <em>italic</em> after", {
					allowedTags: ["b"],
				}),
			).toBe("Before <b>bold</b> middle italic after")
		})

		it("returns nullDisplay for null", () => {
			expect(f.asHtml(null)).toBe("(not set)")
		})

		it("returns empty result when all tags stripped", () => {
			expect(
				f.asHtml("<script>bad</script><style>body{}</style>", {
					allowedTags: [],
				}),
			).toBe("badbody{}")
		})
	})

	// ─── asEmail ──────────────────────────────────────────────────────

	describe("asEmail", () => {
		it("creates a mailto link", () => {
			expect(f.asEmail("test@example.com")).toBe(
				'<a href="mailto:test@example.com">test@example.com</a>',
			)
		})

		it("returns escaped plain text for invalid email", () => {
			expect(f.asEmail("not-an-email")).toBe("not-an-email")
			expect(f.asEmail("@missing-local.com")).toBe("@missing-local.com")
		})

		it("supports custom display text", () => {
			expect(f.asEmail("admin@example.com", { text: "Contact us" })).toBe(
				'<a href="mailto:admin@example.com">Contact us</a>',
			)
		})

		it("supports subject parameter", () => {
			expect(f.asEmail("admin@example.com", { subject: "Hello World" })).toBe(
				'<a href="mailto:admin@example.com?subject=Hello%20World">admin@example.com</a>',
			)
		})

		it("supports body parameter", () => {
			expect(f.asEmail("admin@example.com", { body: "Dear Team," })).toBe(
				'<a href="mailto:admin@example.com?body=Dear%20Team%2C">admin@example.com</a>',
			)
		})

		it("supports subject + body + text together", () => {
			const result = f.asEmail("admin@example.com", {
				text: "Email us",
				subject: "Help",
				body: "I need help",
			})
			expect(result).toBe(
				'<a href="mailto:admin@example.com?subject=Help&body=I%20need%20help">Email us</a>',
			)
		})

		it("escapes HTML in custom display text", () => {
			expect(
				f.asEmail("a@b.com", { text: '<script>alert("xss")</script>' }),
			).toBe(
				'<a href="mailto:a@b.com">&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</a>',
			)
		})
	})

	// ─── asUrl ────────────────────────────────────────────────────────

	describe("asUrl", () => {
		it("creates a hyperlink with target _blank", () => {
			expect(f.asUrl("https://example.com")).toBe(
				'<a href="https://example.com" target="_blank">https://example.com</a>',
			)
		})

		it("prepends http:// when no scheme is present", () => {
			expect(f.asUrl("example.com")).toBe(
				'<a href="http://example.com" target="_blank">example.com</a>',
			)
		})

		it("supports custom target", () => {
			expect(f.asUrl("https://example.com", { target: "_self" })).toBe(
				'<a href="https://example.com" target="_self">https://example.com</a>',
			)
		})

		it("detects ftp:// scheme", () => {
			expect(f.asUrl("ftp://files.example.com")).toBe(
				'<a href="ftp://files.example.com" target="_blank">ftp://files.example.com</a>',
			)
		})

		it("detects ftps:// scheme", () => {
			expect(f.asUrl("ftps://secure.example.com")).toBe(
				'<a href="ftps://secure.example.com" target="_blank">ftps://secure.example.com</a>',
			)
		})

		it("detects mailto: scheme", () => {
			expect(f.asUrl("mailto:test@example.com")).toBe(
				'<a href="mailto:test@example.com" target="_blank">mailto:test@example.com</a>',
			)
		})

		it("supports custom display text", () => {
			expect(f.asUrl("https://example.com", { text: "Click here" })).toBe(
				'<a href="https://example.com" target="_blank">Click here</a>',
			)
		})

		it("supports rel attribute", () => {
			expect(
				f.asUrl("https://example.com", { rel: "noopener noreferrer" }),
			).toBe(
				'<a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>',
			)
		})

		it("supports class attribute", () => {
			expect(f.asUrl("https://example.com", { class: "external-link" })).toBe(
				'<a href="https://example.com" target="_blank" class="external-link">https://example.com</a>',
			)
		})

		it("supports all options together", () => {
			const result = f.asUrl("https://example.com", {
				target: "_self",
				text: "Visit",
				rel: "nofollow",
				class: "btn btn-primary",
			})
			expect(result).toBe(
				'<a href="https://example.com" target="_self" rel="nofollow" class="btn btn-primary">Visit</a>',
			)
		})
	})

	// ─── asImage ──────────────────────────────────────────────────────

	describe("asImage", () => {
		it("creates an img tag", () => {
			expect(f.asImage("/img/photo.jpg")).toBe(
				'<img src="/img/photo.jpg" alt="" />',
			)
		})

		it("supports alt text", () => {
			expect(f.asImage("/img/photo.jpg", { alt: "Profile picture" })).toBe(
				'<img src="/img/photo.jpg" alt="Profile picture" />',
			)
		})

		it("supports width and height (number)", () => {
			expect(f.asImage("/img/photo.jpg", { width: 200, height: 150 })).toBe(
				'<img src="/img/photo.jpg" alt="" width="200" height="150" />',
			)
		})

		it("supports width and height (string)", () => {
			expect(
				f.asImage("/img/photo.jpg", { width: "100%", height: "auto" }),
			).toBe('<img src="/img/photo.jpg" alt="" width="100%" height="auto" />')
		})

		it("supports class attribute", () => {
			expect(f.asImage("/img/photo.jpg", { class: "rounded shadow" })).toBe(
				'<img src="/img/photo.jpg" alt="" class="rounded shadow" />',
			)
		})

		it("supports loading attribute (lazy)", () => {
			expect(f.asImage("/img/photo.jpg", { loading: "lazy" })).toBe(
				'<img src="/img/photo.jpg" alt="" loading="lazy" />',
			)
		})

		it("supports loading attribute (eager)", () => {
			expect(f.asImage("/img/photo.jpg", { loading: "eager" })).toBe(
				'<img src="/img/photo.jpg" alt="" loading="eager" />',
			)
		})

		it("supports all options together", () => {
			const result = f.asImage("/img/photo.jpg", {
				alt: "Banner",
				width: 800,
				height: 400,
				class: "hero-image",
				loading: "lazy",
			})
			expect(result).toBe(
				'<img src="/img/photo.jpg" alt="Banner" width="800" height="400" class="hero-image" loading="lazy" />',
			)
		})
	})

	// ─── asBoolean ────────────────────────────────────────────────────

	describe("asBoolean", () => {
		it("returns Yes/No by default", () => {
			expect(f.asBoolean(true)).toBe("Yes")
			expect(f.asBoolean(false)).toBe("No")
		})

		it("truthy values return Yes", () => {
			expect(f.asBoolean(1)).toBe("Yes")
			expect(f.asBoolean("non-empty")).toBe("Yes")
		})

		it("falsy values return No", () => {
			expect(f.asBoolean(0)).toBe("No")
			expect(f.asBoolean("")).toBe("No")
		})

		it("supports custom booleanFormat", () => {
			const fVi = new Formatter({ booleanFormat: ["Không", "Có"] })
			expect(fVi.asBoolean(true)).toBe("Có")
			expect(fVi.asBoolean(false)).toBe("Không")
		})

		it("returns nullDisplay for null", () => {
			expect(f.asBoolean(null)).toBe("(not set)")
		})
	})

	// ─── asOrdinal (extended locales) ─────────────────────────────────

	describe("asOrdinal - extended locales", () => {
		it("English ordinals", () => {
			const fEn = new Formatter({ locale: "en-US" })
			expect(fEn.asOrdinal(1)).toBe("1st")
			expect(fEn.asOrdinal(2)).toBe("2nd")
			expect(fEn.asOrdinal(3)).toBe("3rd")
			expect(fEn.asOrdinal(4)).toBe("4th")
			expect(fEn.asOrdinal(11)).toBe("11th")
			expect(fEn.asOrdinal(21)).toBe("21st")
		})

		it("French ordinals (er for 1st, e for rest)", () => {
			const fFr = new Formatter({ locale: "fr-FR" })
			expect(fFr.asOrdinal(1)).toBe("1er")
			expect(fFr.asOrdinal(2)).toBe("2e")
			expect(fFr.asOrdinal(10)).toBe("10e")
		})

		it("German ordinals (dot suffix)", () => {
			const fDe = new Formatter({ locale: "de-DE" })
			expect(fDe.asOrdinal(1)).toBe("1.")
			expect(fDe.asOrdinal(5)).toBe("5.")
		})

		it("Vietnamese ordinals (no suffix)", () => {
			const fVi = new Formatter({ locale: "vi-VN" })
			const result = fVi.asOrdinal(1)
			expect(result).toBe("1")
		})

		it("Japanese ordinals (no suffix)", () => {
			const fJa = new Formatter({ locale: "ja-JP" })
			expect(fJa.asOrdinal(1)).toBe("1")
		})

		it("registerOrdinalSuffixes allows runtime extension", () => {
			Formatter.registerOrdinalSuffixes("nl", {
				other: "e",
			})
			const fNl = new Formatter({ locale: "nl-NL" })
			expect(fNl.asOrdinal(1)).toBe("1e")
			expect(fNl.asOrdinal(5)).toBe("5e")
		})
	})

	// ─── nullDisplay ──────────────────────────────────────────────────

	describe("nullDisplay", () => {
		it("custom nullDisplay", () => {
			const fCustom = new Formatter({ nullDisplay: "N/A" })
			expect(fCustom.asText(null)).toBe("N/A")
			expect(fCustom.asDecimal(null)).toBe("N/A")
			expect(fCustom.asDate(null)).toBe("N/A")
		})
	})
})
