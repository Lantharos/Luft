import { listen } from '@lantharos/sabine';

const PALETTE_CHANGED = 'kestrel.palette';
const SCHEME_CHANGED = 'appearance.scheme';

export interface TerminalColors {
	light: Record<string, string>;
	dark: Record<string, string>;
}

export type AppIconStyle = 'default' | 'tinted' | 'clear';

export interface AppIconPaint {
	plate: string;
	ink: string;
	shade: string;
	rim: number;
}

export interface AppIcons {
	style: AppIconStyle;
	glyphs: string;
	tinted: AppIconPaint;
	clear: AppIconPaint;
}

export interface Palette {
	accent: string;
	pureBlack: boolean;
	colors: Record<string, string>;
	terminal: TerminalColors;
	appIcons: AppIcons;
}

const TERMINAL_HUES = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

export type Scheme = 'dark' | 'light';

export interface Appearance {
	translucent: boolean;
	palette: Palette | null;
	scheme: Scheme;
}

function readableOn(hex: string) {
	const [red, green, blue] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
	return luminance > 0.5 ? '#181817' : '#f7f7f4';
}

class AppearanceState {
	translucent = $state(false);
	accent = $state<string | null>(null);
	accentText = $derived(this.accent ? readableOn(this.accent) : null);
	scheme = $state<Scheme>('dark');
	pureBlack = $state(false);
	colors = $state<Record<string, string>>({});
	terminal = $state<TerminalColors>({ light: {}, dark: {} });
	appIcons = $state<AppIcons | null>(null);

	start(initial: Appearance) {
		this.translucent = initial.translucent;
		this.scheme = initial.scheme;
		if (initial.palette) this.receive(initial.palette);
		const stops = [
			listen<Palette>(PALETTE_CHANGED, (palette) => this.receive(palette)),
			listen<Scheme>(SCHEME_CHANGED, (scheme) => (this.scheme = scheme))
		];
		return () => stops.forEach((stop) => stop());
	}

	private receive(palette: Palette) {
		this.accent = palette.accent;
		this.pureBlack = palette.pureBlack;
		this.colors = palette.colors;
		this.terminal = palette.terminal;
		this.appIcons = palette.appIcons;
		const root = document.documentElement;
		root.toggleAttribute('data-black', palette.pureBlack);
		for (const scheme of ['light', 'dark'] as const) {
			TERMINAL_HUES.forEach((hue, index) => root.style.setProperty(`--kestrel-${scheme}-${hue}`, palette.terminal[scheme][`color${index + 1}`]));
		}
	}
}

export const appearance = new AppearanceState();
