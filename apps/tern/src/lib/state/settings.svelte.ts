import { appearance } from '@luft/ui';
import { updateSettings } from '#lib/api.js';
import { LUFT_COLORS, terminalTheme, withAlpha } from '#lib/terminal/palette.js';
import type { TerminalOptions } from '#lib/terminal/session.svelte.js';
import type { AppState, Settings } from '#lib/types.js';

const DEFAULTS: Settings = {
	fontSize: 13,
	scrollback: 10_000,
	cursorStyle: 'block',
	cursorBlink: true,
	translucent: true,
	opacity: 0.86,
	scheme: 'system',
	shell: null,
	copyOnSelect: false,
	clipboardReads: false
};

export const FONT_SIZES = { min: 8, max: 32 };
const LIGHT_MINIMUM_CONTRAST = 3;

class SettingsState {
	current = $state<Settings>(DEFAULTS);
	defaultShell = $state('');
	shells = $state<string[]>([]);
	glass = $state(false);
	scheme = $derived(this.current.scheme === 'system' ? appearance.scheme : this.current.scheme);
	translucent = $derived(this.glass && this.current.translucent);
	colors = $derived(appearance.terminal[this.scheme].color0 ? appearance.terminal[this.scheme] : LUFT_COLORS[this.scheme]);
	accent = $derived(this.colors.cursor);
	theme = $derived(terminalTheme(this.colors, this.scheme, this.translucent));
	surface = $derived(this.translucent ? withAlpha(this.colors.background, this.current.opacity) : this.colors.background);
	options = $derived<TerminalOptions>({
		fontFamily: appearance.fontMono,
		fontSize: this.current.fontSize * appearance.typography.textScale,
		scrollback: this.current.scrollback,
		cursorStyle: this.current.cursorStyle,
		cursorBlink: this.current.cursorBlink,
		theme: this.theme,
		transparent: this.translucent,
		minimumContrastRatio: this.scheme === 'light' ? LIGHT_MINIMUM_CONTRAST : 1
	});

	start(state: AppState) {
		this.current = state.settings;
		this.defaultShell = state.defaultShell;
		this.shells = state.shells;
		this.glass = state.glass;
	}

	update(patch: Partial<Settings>) {
		this.current = { ...this.current, ...patch };
		void updateSettings($state.snapshot(this.current));
	}

	zoom(step: number) {
		const fontSize = step === 0 ? DEFAULTS.fontSize : this.current.fontSize + step;
		this.update({ fontSize: Math.min(FONT_SIZES.max, Math.max(FONT_SIZES.min, fontSize)) });
	}
}

export const settings = new SettingsState();
