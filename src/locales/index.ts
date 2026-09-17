import { enNumberShort, enSpellout } from "./en.js"
import type {
	LocaleRegistry,
	LocaleSpellout,
	NumberShortConfig,
	NumberShortRegistry,
} from "./types.js"
import { viNumberShort, viSpellout } from "./vi.js"

export type { LocaleSpellout, NumberShortConfig } from "./types.js"

/** Built-in spellout locale registry. */
const spelloutRegistry: LocaleRegistry = {
	en: enSpellout,
	vi: viSpellout,
}

/** Built-in number-short locale registry. */
const numberShortRegistry: NumberShortRegistry = {
	en: enNumberShort,
	vi: viNumberShort,
}

/** Get the spellout provider for a locale, falling back to English. */
export function getSpellout(locale: string): LocaleSpellout {
	const lang = locale.split("-")[0]
	return spelloutRegistry[lang] ?? enSpellout
}

/** Get the number-short config for a locale, falling back to English. */
export function getNumberShortConfig(locale: string): NumberShortConfig {
	const lang = locale.split("-")[0]
	return numberShortRegistry[lang] ?? enNumberShort
}

/** Register a custom spellout locale at runtime. */
export function registerSpellout(lang: string, impl: LocaleSpellout): void {
	spelloutRegistry[lang] = impl
}

/** Register a custom number-short config at runtime. */
export function registerNumberShort(
	lang: string,
	config: NumberShortConfig,
): void {
	numberShortRegistry[lang] = config
}
