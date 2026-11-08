import { commands } from '#lib/bindings.js';

export type BarrelAction = 'eraser' | 'highlighter' | 'none';

export interface SettingsValues {
	firmness: number;
	stabilization: number;
	barrel: BarrelAction;
	secondBarrel: BarrelAction;
	touchDraws: boolean;
	fingerPans: boolean;
	toolbar: 'top' | 'side';
	continuous: boolean;
	prediction: boolean;
}

const DEFAULTS: SettingsValues = {
	firmness: 0,
	stabilization: 0.3,
	barrel: 'eraser',
	secondBarrel: 'none',
	touchDraws: false,
	fingerPans: true,
	toolbar: 'top',
	continuous: true,
	prediction: true
};

const SAVE_AFTER = 500;

class Settings {
	values: SettingsValues = $state({ ...DEFAULTS });
	private timer = 0;

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
