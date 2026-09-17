import { Formatter } from "./formatter.js"
import type { FormatterOptions } from "./types.js"

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
let instance = new Formatter()

/** The global Formatter singleton. Ready to use after `configureFormatter()`. */
export const formatter = new Proxy({} as Formatter, {
	get(_target, prop, receiver) {
		return Reflect.get(instance, prop, receiver)
	},
})

/**
 * Configure the global formatter once (typically at app bootstrap).
 * Replaces the internal instance - all existing `formatter` references
 * automatically pick up the new config via the proxy.
 */
export function configureFormatter(options: FormatterOptions): void {
	instance = new Formatter(options)
}
