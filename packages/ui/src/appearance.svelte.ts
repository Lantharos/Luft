import { listen } from '@lantharos/sabine';

const PALETTE_CHANGED = 'kestrel.palette';
const SCHEME_CHANGED = 'appearance.scheme';

export interface SchemeColors {
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
	wallpaperAccent: string;
	pureBlack: boolean;
	colors: SchemeColors;
	terminal: SchemeColors;
	appIcons: AppIcons;
}

const TERMINAL_HUES = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
const SCHEMES = ['light', 'dark'] as const;

export type Scheme = 'dark' | 'light';

export interface Appearance {
	translucent: boolean;
	palette: Palette | null;
	scheme: Scheme;
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

class AppearanceState {
	translucent = $state(false);
	accent = $state<string | null>(null);
	wallpaperAccent = $state<string | null>(null);
	scheme = $state<Scheme>('dark');
	pureBlack = $state(false);
	colors = $state<SchemeColors>({ light: {}, dark: {} });
	terminal = $state<SchemeColors>({ light: {}, dark: {} });
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
		this.wallpaperAccent = palette.wallpaperAccent;
		this.pureBlack = palette.pureBlack;
		this.colors = palette.colors;
		this.terminal = palette.terminal;
		this.appIcons = palette.appIcons;
		const root = document.documentElement;
		root.toggleAttribute('data-black', palette.pureBlack);
		for (const scheme of SCHEMES) {
			for (const [role, color] of Object.entries(palette.colors[scheme])) root.style.setProperty(`--kestrel-${scheme}-${kebab(role)}`, color);
			TERMINAL_HUES.forEach((hue, index) => root.style.setProperty(`--kestrel-${scheme}-${hue}`, palette.terminal[scheme][`color${index + 1}`]));
		}
	}
}

export const appearance = new AppearanceState();
