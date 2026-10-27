import { events as systemEvents, system } from '@lantharos/sabine';
import { i18n } from '@luft/i18n';

import { events, type AppIcons, type Appearance, type Corners, type Motion, type Palette, type SchemeColors, type Typography } from './bindings/appearance';
import type { TaskbarLooks } from './taskbar/looks';

export type { AppIconStyle, Appearance, Palette, SchemeColors } from './bindings/appearance';

const SANS = "'Open Runde', ui-sans-serif, system-ui, sans-serif";
const MONO = "'Maple Mono NF', ui-monospace, monospace";

const TERMINAL_HUES = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
const SCHEMES = ['light', 'dark'] as const;

export type Scheme = 'dark' | 'light';

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
	taskbar = $state<TaskbarLooks | null>(null);
	typography = $state<Typography>({ interface: null, monospace: null, textScale: 1 });
	motion = $state<Motion>('full');
	corners = $state<Corners>('rounded');
	fontSans = $derived(fontList(this.typography.interface, SANS));
	fontMono = $derived(fontList(this.typography.monospace, MONO));

	start(initial: Appearance) {
		this.translucent = true;
		if (initial.palette) this.receive(initial.palette);
		this.type(initial.typography);
		this.move(initial.motion);
		this.round(initial.corners);
		void i18n.start(initial.locale);
		const stops = [
			events.kestrelPalette((palette) => this.receive(palette)),
			systemEvents.appearanceChanged(({ colorScheme }) => (this.scheme = colorScheme)),
			events.appearanceTypography((typography) => this.type(typography)),
			events.appearanceMotion((motion) => this.move(motion)),
			events.appearanceCorners((corners) => this.round(corners))
		];
		void system.appearance().then(({ colorScheme }) => (this.scheme = colorScheme));
		return () => stops.forEach((stop) => stop());
	}

	private move(motion: Motion) {
		this.motion = motion;
		document.documentElement.dataset.motion = motion;
	}

	private round(corners: Corners) {
		this.corners = corners;
		document.documentElement.dataset.corners = corners;
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
		this.taskbar = palette.taskbar;
		const root = document.documentElement;
		root.toggleAttribute('data-black', palette.pureBlack);
		for (const scheme of SCHEMES) {
			for (const [role, color] of Object.entries(palette.colors[scheme])) root.style.setProperty(`--kestrel-${scheme}-${kebab(role)}`, color);
			TERMINAL_HUES.forEach((hue, index) => root.style.setProperty(`--kestrel-${scheme}-${hue}`, palette.terminal[scheme][`color${index + 1}`]));
		}
	}
}

export const appearance = new AppearanceState();
