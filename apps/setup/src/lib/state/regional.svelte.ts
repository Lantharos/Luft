import { catalog, formatsCountry, locate, setFormats, useKeyboard, useZone, type Catalog, type KeyboardLayout, type Zone } from '#lib/api/system.js';
import type { Hints, Keyboard } from '#lib/api/installer.js';
import { describe, outranks, type Field, type Guesses, type Source } from '#lib/regional/guesses.js';
import { countryOf, DEFAULT_LANGUAGE, keyboardFor, languageFor, languageNamed, LANGUAGES, type Language } from '#lib/regional/languages.js';

const FALLBACK_ZONE = 'UTC';

const sameKeyboard = (a: Keyboard, b: Keyboard) => a.layout === b.layout && a.variant === b.variant;

class RegionalState {
	catalog = $state<Catalog>({ keyboards: [], zones: [] });
	language = $state<Language>(DEFAULT_LANGUAGE);
	keyboard = $state<Keyboard>({ layout: 'us', variant: '' });
	zone = $state(FALLBACK_ZONE);
	guesses = $state<Guesses>({});
	private chosen = new Set<Field>();
	private located = false;

	keyboardName = $derived(this.catalog.keyboards.find((entry) => sameKeyboard(entry, this.keyboard))?.name ?? this.keyboard.layout);
	zoneEntry = $derived(this.catalog.zones.find((entry) => entry.id === this.zone) ?? null);
	description = $derived(describe(this.guesses));

	async start() {
		this.catalog = await catalog();
		await this.locate();
	}

	async locate() {
		if (this.located) return;
		const location = await locate().catch(() => null);
		if (!location?.time_zone) return;
		this.located = true;
		if (this.guess('zone', 'network')) this.applyZone(location.time_zone);
	}

	suggestFrom(hints: Hints) {
		const country = countryOf(hints.locale);
		const language = languageNamed(hints.language) ?? languageFor(country);
		if (language && this.guess('language', 'computer')) this.language = language;
		const layout = keyboardFor(country);
		const keyboard = hints.keyboards[0] ?? (layout ? { layout, variant: '' } : null);
		if (keyboard && this.guess('keyboard', 'computer')) this.applyKeyboard(keyboard);
		const zone = hints.timezone ?? this.catalog.zones.find((entry) => entry.code === country)?.id;
		if (zone && this.guess('zone', 'computer')) this.applyZone(zone);
	}

	async adoptFormats() {
		const country = await formatsCountry();
		if (!country || countryOf(navigator.language) === country) return;
		const { language } = new Intl.Locale(`und-${country}`).maximize();
		await setFormats(`${language}_${country}.UTF-8`);
	}

	chooseLanguage(language: Language) {
		this.chosen.add('language');
		this.language = language;
	}

	chooseKeyboard(keyboard: KeyboardLayout) {
		this.chosen.add('keyboard');
		this.applyKeyboard({ layout: keyboard.layout, variant: keyboard.variant });
	}

	chooseZone(zone: Zone) {
		this.chosen.add('zone');
		this.applyZone(zone.id);
	}

	private guess(field: Field, source: Source) {
		if (this.chosen.has(field) || !outranks(source, this.guesses[field])) return false;
		this.guesses[field] = source;
		return true;
	}

	private applyKeyboard(keyboard: Keyboard) {
		if (sameKeyboard(keyboard, this.keyboard)) return;
		this.keyboard = keyboard;
		void useKeyboard(keyboard.layout, keyboard.variant).catch(() => {});
	}

	private applyZone(zone: string) {
		if (zone === this.zone) return;
		this.zone = zone;
		void useZone(zone).catch(() => {});
	}

	get languages() {
		return LANGUAGES;
	}
}

export const regional = new RegionalState();
