import { catalog, locate, useKeyboard, useZone, type Catalog, type KeyboardLayout, type Zone } from '#lib/api/system.js';
import type { Hints, Keyboard } from '#lib/api/installer.js';
import { countryOf, DEFAULT_LANGUAGE, keyboardFor, languageFor, LANGUAGES, type Language } from '#lib/regional/languages.js';

type Field = 'language' | 'keyboard' | 'zone';

interface Suggestion {
	country?: string | null;
	timezone?: string | null;
	keyboard?: Keyboard | null;
	locale?: string | null;
}

const FALLBACK_ZONE = 'UTC';

const sameKeyboard = (a: Keyboard, b: Keyboard) => a.layout === b.layout && a.variant === b.variant;

class RegionalState {
	catalog = $state<Catalog>({ keyboards: [], zones: [] });
	language = $state<Language>(DEFAULT_LANGUAGE);
	keyboard = $state<Keyboard>({ layout: 'us', variant: '' });
	zone = $state(FALLBACK_ZONE);
	private chosen = new Set<Field>();
	private located = false;

	keyboardName = $derived(this.catalog.keyboards.find((entry) => sameKeyboard(entry, this.keyboard))?.name ?? this.keyboard.layout);
	zoneEntry = $derived(this.catalog.zones.find((entry) => entry.id === this.zone) ?? null);


	async start() {
		this.catalog = await catalog();
		await this.locate();
	}

	async locate() {
		if (this.located) return;
		const location = await locate().catch(() => null);
		if (!location?.time_zone) return;
		this.located = true;
		if (!this.chosen.has('zone') && location.time_zone !== this.zone) this.applyZone(location.time_zone);
	}

	suggestFrom(hints: Hints, firmwareLanguage: string | null) {
		this.suggest({ country: countryOf(firmwareLanguage), locale: firmwareLanguage });
		this.suggest({ country: countryOf(hints.locale), timezone: hints.timezone, keyboard: hints.keyboard, locale: hints.locale });
	}

	suggest({ country = null, timezone = null, keyboard = null, locale = null }: Suggestion) {
		const language = languageFor(countryOf(locale)) ?? languageFor(country);
		if (language && !this.chosen.has('language')) this.language = language;
		const layout = keyboard ?? (keyboardFor(country) ? { layout: keyboardFor(country)!, variant: '' } : null);
		if (layout && !this.chosen.has('keyboard') && !sameKeyboard(layout, this.keyboard)) this.applyKeyboard(layout);
		const zone = timezone ?? this.catalog.zones.find((entry) => entry.code === country)?.id ?? null;
		if (zone && !this.chosen.has('zone') && zone !== this.zone) this.applyZone(zone);
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

	private applyKeyboard(keyboard: Keyboard) {
		this.keyboard = keyboard;
		void useKeyboard(keyboard.layout, keyboard.variant).catch(() => {});
	}

	private applyZone(zone: string) {
		this.zone = zone;
		void useZone(zone).catch(() => {});
	}

	get languages() {
		return LANGUAGES;
	}
}

export const regional = new RegionalState();
