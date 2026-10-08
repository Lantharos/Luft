import { events, listen, system } from '@lantharos/sabine';

const PALETTE_CHANGED = 'kestrel.palette';
const TYPOGRAPHY_CHANGED = 'appearance.typography';
const SANS = "'Open Runde', ui-sans-serif, system-ui, sans-serif";
const MONO = "'Maple Mono NF', ui-monospace, monospace";

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

export interface Typography {
	interface: string | null;
	monospace: string | null;
	textScale: number;
}

export interface Appearance {
	palette: Palette | null;
	typography: Typography;
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const fontList = (family: string | null, fallback: string) => (family ? `"${family.replace(/["\\]/g, '\\$&')}", ${fallback}` : fallback);

class AppearanceState {
	translucent = $state(false);
	accent = $state<string | null>(null);
	wallpaperAccent = $state<string | null>(null);
	scheme = $state<Scheme>('dark');
	pureBlack = $state(false);
	colors = $state<SchemeColors>({ light: {}, dark: {} });
	terminal = $state<SchemeColors>({ light: {}, dark: {} });
	appIcons = $state<AppIcons | null>(null);
	typography = $state<Typography>({ interface: null, monospace: null, textScale: 1 });
	fontSans = $derived(fontList(this.typography.interface, SANS));
	fontMono = $derived(fontList(this.typography.monospace, MONO));

	start(initial: Appearance) {
		this.translucent = true;
		if (initial.palette) this.receive(initial.palette);
		this.type(initial.typography);
		const stops = [
			listen<Palette>(PALETTE_CHANGED, (palette) => this.receive(palette)),
			events.appearanceChanged(({ colorScheme }) => (this.scheme = colorScheme)),
			listen<Typography>(TYPOGRAPHY_CHANGED, (typography) => this.type(typography))
		];
		void system.appearance().then(({ colorScheme }) => (this.scheme = colorScheme));
		return () => stops.forEach((stop) => stop());
	}

	private type(typography: Typography) {
		this.typography = typography;
		const root = document.documentElement.style;
		root.setProperty('--font-sans', this.fontSans);
		root.setProperty('--font-mono', this.fontMono);
		root.setProperty('--text-scale', String(typography.textScale));
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
