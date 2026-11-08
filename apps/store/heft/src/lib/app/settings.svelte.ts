import { appearance } from '@luft/ui';
import { commands } from '#lib/bindings.js';

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
	languages: []
};

const SAVE_AFTER = 500;

class Settings {
	values: SettingsValues = $state({ ...DEFAULTS });
	private timer = 0;

	/** Folded into a tablet, the tools move to the side, where the hand that isn't writing reaches them. */
	get toolbar(): ToolbarPlace {
		return appearance.posture === 'tablet' ? 'side' : this.values.toolbar;
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
