import { i18n } from '@luft/i18n';
import { commands, type Catalog, type Hints, type Keyboard, type KeyboardLayout, type Zone } from '#lib/bindings.js';
import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';
import { describe, outranks, type Field, type Guesses, type Source } from '#lib/regional/guesses.js';
import { namedZones } from '#lib/regional/zones.js';
import { countryOf, DEFAULT_LANGUAGE, formatsIn, keyboardFor, languageFor, languageNamed, LANGUAGES, languageTag, type Language } from '#lib/regional/languages.js';

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
	zones = $derived(namedZones(this.catalog.zones, i18n.locale));
	zoneEntry = $derived(this.zones.find((entry) => entry.id === this.zone) ?? null);
	description = $derived(describe(this.guesses));

	async start() {
		this.catalog = await commands.regionalCatalog();
		await this.locate();
	}

	async locate() {
		if (this.located) return;
		const location = await commands.regionalLocate().catch(() => null);
		if (!location?.time_zone) return;
		this.located = true;
		if (this.guess('zone', 'network')) this.applyZone(location.time_zone);
	}

	suggestFrom(hints: Hints) {
		const country = countryOf(hints.locale);
		const language = languageNamed(hints.language) ?? languageFor(country);
		if (language && this.guess('language', 'computer')) this.applyLanguage(language);
		const layout = keyboardFor(country);
		const keyboard = hints.keyboards[0] ?? (layout ? { layout, variant: '' } : null);
		if (keyboard && this.guess('keyboard', 'computer')) this.applyKeyboard(keyboard);
		const zone = hints.timezone ?? this.catalog.zones.find((entry) => entry.code === country)?.id;
		if (zone && this.guess('zone', 'computer')) this.applyZone(zone);
	}

	async adoptFormats() {
		const country = await commands.regionalFormatsCountry();
		const formats = country && formatsIn(i18n.formats, country);
		if (formats) await commands.regionalSetFormats({ region: formats });
	}

	chooseLanguage(language: Language) {
		this.chosen.add('language');
		this.applyLanguage(language);
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

	private applyLanguage(language: Language) {
		if (language === this.language) return;
		this.language = language;
		const tag = languageTag(language);
		void i18n.use(tag, tag);
		void commands
			.regionalLanguage({ language: language.locale })
			.then(async () => (this.catalog = await commands.regionalCatalog()))
			.catch(() => {});
	}

	private applyKeyboard(keyboard: Keyboard) {
		if (sameKeyboard(keyboard, this.keyboard)) return;
		this.keyboard = keyboard;
		void commands.regionalKeyboard({ layout: keyboard.layout, variant: keyboard.variant }, WAIT_FOR_PERSON).catch(() => {});
	}

	private applyZone(zone: string) {
		if (zone === this.zone) return;
		this.zone = zone;
		void commands.regionalZone({ zone }, WAIT_FOR_PERSON).catch(() => {});
	}

	get languages() {
		return LANGUAGES;
	}
}

export const regional = new RegionalState();
