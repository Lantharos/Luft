import type { ITheme } from '@xterm/xterm';
import type { Scheme, SchemeColors } from '@luft/ui';

type Colors = Record<string, string>;

const ANSI = [
	'black',
	'red',
	'green',
	'yellow',
	'blue',
	'magenta',
	'cyan',
	'white',
	'brightBlack',
	'brightRed',
	'brightGreen',
	'brightYellow',
	'brightBlue',
	'brightMagenta',
	'brightCyan',
	'brightWhite'
] as const;

const ansi = (colors: string[]) => Object.fromEntries(colors.map((color, index) => [`color${index}`, color]));

export const LUFT_COLORS: SchemeColors = {
	dark: {
		foreground: '#e4e4de',
		background: '#121211',
		cursor: '#f3f3ef',
		cursorText: '#181817',
		selectionBackground: '#3c3c39',
		selectionForeground: '#f3f3ef',
		...ansi([
			'#2c2c29', '#e58c84', '#7aba7c', '#bda750', '#73aceb', '#cf8ec9', '#39bcc3', '#c9c9c3',
			'#7a7a72', '#fba8a0', '#98d299', '#d4c174', '#92c5ff', '#e6aae0', '#68d5da', '#f3f3ef'
		])
	},
	light: {
		foreground: '#2a2a27',
		background: '#fbfbf9',
		cursor: '#1b1b19',
		cursorText: '#ffffff',
		selectionBackground: '#dcdcd6',
		selectionForeground: '#1b1b19',
		...ansi([
			'#2a2a27', '#aa4844', '#317f38', '#7f6a00', '#296eb4', '#944c8f', '#007b80', '#c2c2bb',
			'#75756e', '#9a3130', '#106e20', '#6b5a00', '#015ba6', '#84377f', '#00686c', '#e4e4de'
		])
	}
};

export function withAlpha(hex: string, alpha: number) {
	const [red, green, blue] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function terminalTheme(colors: Colors, scheme: Scheme, translucent: boolean): ITheme {
	const scrollbar = colors.foreground;
	return {
		...Object.fromEntries(ANSI.map((name, index) => [name, colors[`color${index}`]])),
		foreground: colors.foreground,
		background: translucent ? withAlpha(colors.background, 0) : colors.background,
		cursor: colors.cursor,
		cursorAccent: colors.cursorText,
		selectionBackground: colors.selectionBackground,
		selectionForeground: colors.selectionForeground,
		selectionInactiveBackground: withAlpha(colors.selectionBackground, 0.6),
		scrollbarSliderBackground: withAlpha(scrollbar, scheme === 'dark' ? 0.14 : 0.18),
		scrollbarSliderHoverBackground: withAlpha(scrollbar, 0.26),
		scrollbarSliderActiveBackground: withAlpha(scrollbar, 0.34)
	};
}
