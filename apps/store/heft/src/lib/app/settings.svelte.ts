import { commands } from '#lib/bindings.js';
import { arrangement } from './arrangement.svelte';
import type { Processing } from '#lib/recording/model.js';

export type ToolbarPlace = 'top' | 'side';
export type PageFlow = 'continuous' | 'single';

export interface SettingsValues {
	firmness: number;
	stabilization: number;
	touchDraws: boolean;
	fingerPans: boolean;
	prediction: boolean;
	toolbar: ToolbarPlace;
	pages: PageFlow;
	handwriting: boolean;
	convert: boolean;
	/** How long the pen rests before writing turns into text, in milliseconds. */
	convertAfter: number;
	keepCorrections: boolean;
	/** The languages the person writes in, for where accents go; empty for the system's. */
	languages: string[];
	/** When heavy background work runs, transcribing and making notes of recordings and reading handwriting for search; null waits for the charger on computers with a battery. */
	backgroundWork: Processing | null;
}

const DEFAULTS: SettingsValues = {
	firmness: 0,
	stabilization: 0.3,
	touchDraws: false,
	fingerPans: true,
	prediction: true,
	toolbar: 'top',
	pages: 'continuous',
	handwriting: false,
	convert: false,
	convertAfter: 800,
	keepCorrections: false,
	languages: [],
	backgroundWork: null
};

const SAVE_AFTER = 500;

class Settings {
	values: SettingsValues = $state({ ...DEFAULTS });
	private timer = 0;

	/** Folded into a tablet or standing upright, the tools sit in a bar above the page. */
	get toolbar(): ToolbarPlace | 'bar' {
		return arrangement.tablet ? 'bar' : this.values.toolbar;
	}

	async load() {
		const stored = (await commands.settingsLoad({ name: 'settings' })) as Partial<SettingsValues> | null;
		this.values = { ...DEFAULTS, ...stored };
	}

	set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
		this.values[key] = value;
		clearTimeout(this.timer);
		this.timer = window.setTimeout(() => void commands.settingsSave({ name: 'settings', value: $state.snapshot(this.values) }), SAVE_AFTER);
	}
}

export const settings = new Settings();
