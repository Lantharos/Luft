export type Geometry = 'ansi' | 'iso' | 'jis';

export interface Cap {
	name: string;
	x: number;
	y: number;
	width: number;
	label?: string;
	enter?: boolean;
}

export const GEOMETRIES = [
	{ value: 'ansi' as const, label: 'ANSI' },
	{ value: 'iso' as const, label: 'ISO' },
	{ value: 'jis' as const, label: 'JIS' }
];

export const WIDTH = 15;
export const HEIGHT = 5;

const NUMBERS = ['AE01', 'AE02', 'AE03', 'AE04', 'AE05', 'AE06', 'AE07', 'AE08', 'AE09', 'AE10', 'AE11', 'AE12'];
const TOP = ['AD01', 'AD02', 'AD03', 'AD04', 'AD05', 'AD06', 'AD07', 'AD08', 'AD09', 'AD10', 'AD11', 'AD12'];
const HOME = ['AC01', 'AC02', 'AC03', 'AC04', 'AC05', 'AC06', 'AC07', 'AC08', 'AC09', 'AC10', 'AC11'];
const BOTTOM = ['AB01', 'AB02', 'AB03', 'AB04', 'AB05', 'AB06', 'AB07', 'AB08', 'AB09', 'AB10'];

export const CODES: Record<string, string> = {
	Backquote: 'TLDE',
	Digit1: 'AE01',
	Digit2: 'AE02',
	Digit3: 'AE03',
	Digit4: 'AE04',
	Digit5: 'AE05',
	Digit6: 'AE06',
	Digit7: 'AE07',
	Digit8: 'AE08',
	Digit9: 'AE09',
	Digit0: 'AE10',
	Minus: 'AE11',
	Equal: 'AE12',
	IntlYen: 'AE13',
	KeyQ: 'AD01',
	KeyW: 'AD02',
	KeyE: 'AD03',
	KeyR: 'AD04',
	KeyT: 'AD05',
	KeyY: 'AD06',
	KeyU: 'AD07',
	KeyI: 'AD08',
	KeyO: 'AD09',
	KeyP: 'AD10',
	BracketLeft: 'AD11',
	BracketRight: 'AD12',
	Backslash: 'BKSL',
	KeyA: 'AC01',
	KeyS: 'AC02',
	KeyD: 'AC03',
	KeyF: 'AC04',
	KeyG: 'AC05',
	KeyH: 'AC06',
	KeyJ: 'AC07',
	KeyK: 'AC08',
	KeyL: 'AC09',
	Semicolon: 'AC10',
	Quote: 'AC11',
	IntlBackslash: 'LSGT',
	KeyZ: 'AB01',
	KeyX: 'AB02',
	KeyC: 'AB03',
	KeyV: 'AB04',
	KeyB: 'AB05',
	KeyN: 'AB06',
	KeyM: 'AB07',
	Comma: 'AB08',
	Period: 'AB09',
	Slash: 'AB10',
	IntlRo: 'AB11',
	Space: 'SPCE',
	ShiftLeft: 'LFSH',
	ShiftRight: 'RTSH',
	AltRight: 'RALT',
	CapsLock: 'CAPS'
};

export const PHYSICAL: Record<string, string> = {
	...CODES,
	Backspace: 'BKSP',
	Tab: 'TAB',
	Enter: 'RTRN',
	ControlLeft: 'LCTL',
	ControlRight: 'RCTL',
	MetaLeft: 'LWIN',
	MetaRight: 'RWIN',
	AltLeft: 'LALT',
	ContextMenu: 'COMP',
	NonConvert: 'MUHE',
	Convert: 'HENK',
	KanaMode: 'HKTG'
};

export const US_LABELS: Record<string, string> = Object.fromEntries([
	['TLDE', '`'],
	...NUMBERS.map((name, index) => [name, '1234567890-='[index]]),
	['AE13', '¥'],
	...TOP.map((name, index) => [name, 'QWERTYUIOP[]'[index]]),
	['BKSL', '\\'],
	...HOME.map((name, index) => [name, "ASDFGHJKL;'"[index]]),
	['LSGT', '<'],
	...BOTTOM.map((name, index) => [name, 'ZXCVBNM,./'[index]]),
	['AB11', 'ろ'],
	['SPCE', 'Space']
]);

export const TYPING = new Set(['TLDE', ...NUMBERS, 'AE13', ...TOP, 'BKSL', ...HOME, 'LSGT', ...BOTTOM, 'AB11', 'SPCE']);

function row(names: string[], start: number, y: number): Cap[] {
	return names.map((name, index) => ({ name, x: start + index, y, width: 1 }));
}

function modifiers(geometry: Geometry): Cap[] {
	const y = 4;
	if (geometry === 'jis') {
		return [
			{ name: 'LCTL', x: 0, y, width: 1.25, label: 'Ctrl' },
			{ name: 'LWIN', x: 1.25, y, width: 1.25, label: 'Super' },
			{ name: 'LALT', x: 2.5, y, width: 1.25, label: 'Alt' },
			{ name: 'MUHE', x: 3.75, y, width: 1.25, label: '無変換' },
			{ name: 'SPCE', x: 5, y, width: 2.5 },
			{ name: 'HENK', x: 7.5, y, width: 1.25, label: '変換' },
			{ name: 'HKTG', x: 8.75, y, width: 1.25, label: 'かな' },
			{ name: 'RALT', x: 10, y, width: 1.25, label: 'Alt' },
			{ name: 'RWIN', x: 11.25, y, width: 1.25, label: 'Super' },
			{ name: 'COMP', x: 12.5, y, width: 1.25, label: 'Menu' },
			{ name: 'RCTL', x: 13.75, y, width: 1.25, label: 'Ctrl' }
		];
	}
	return [
		{ name: 'LCTL', x: 0, y, width: 1.25, label: 'Ctrl' },
		{ name: 'LWIN', x: 1.25, y, width: 1.25, label: 'Super' },
		{ name: 'LALT', x: 2.5, y, width: 1.25, label: 'Alt' },
		{ name: 'SPCE', x: 3.75, y, width: 6.25 },
		{ name: 'RALT', x: 10, y, width: 1.25, label: 'Alt' },
		{ name: 'RWIN', x: 11.25, y, width: 1.25, label: 'Super' },
		{ name: 'COMP', x: 12.5, y, width: 1.25, label: 'Menu' },
		{ name: 'RCTL', x: 13.75, y, width: 1.25, label: 'Ctrl' }
	];
}

export function caps(geometry: Geometry): Cap[] {
	const iso = geometry !== 'ansi';
	const numbers =
		geometry === 'jis'
			? [...row(['TLDE', ...NUMBERS, 'AE13'], 0, 0), { name: 'BKSP', x: 14, y: 0, width: 1, label: 'Back' }]
			: [...row(['TLDE', ...NUMBERS], 0, 0), { name: 'BKSP', x: 13, y: 0, width: 2, label: 'Backspace' }];
	const top = [
		{ name: 'TAB', x: 0, y: 1, width: 1.5, label: 'Tab' },
		...row(TOP, 1.5, 1),
		iso ? { name: 'RTRN', x: 13.5, y: 1, width: 1.5, label: 'Enter', enter: true } : { name: 'BKSL', x: 13.5, y: 1, width: 1.5 }
	];
	const home = [
		{ name: 'CAPS', x: 0, y: 2, width: 1.75, label: 'Caps Lock' },
		...row(HOME, 1.75, 2),
		iso ? { name: 'BKSL', x: 12.75, y: 2, width: 1 } : { name: 'RTRN', x: 12.75, y: 2, width: 2.25, label: 'Enter' }
	];
	const bottom =
		geometry === 'iso'
			? [{ name: 'LFSH', x: 0, y: 3, width: 1.25, label: 'Shift' }, ...row(['LSGT', ...BOTTOM], 1.25, 3), { name: 'RTSH', x: 12.25, y: 3, width: 2.75, label: 'Shift' }]
			: geometry === 'jis'
				? [{ name: 'LFSH', x: 0, y: 3, width: 2.25, label: 'Shift' }, ...row([...BOTTOM, 'AB11'], 2.25, 3), { name: 'RTSH', x: 13.25, y: 3, width: 1.75, label: 'Shift' }]
				: [{ name: 'LFSH', x: 0, y: 3, width: 2.25, label: 'Shift' }, ...row(BOTTOM, 2.25, 3), { name: 'RTSH', x: 12.25, y: 3, width: 2.75, label: 'Shift' }];
	return [...numbers, ...top, ...home, ...bottom, ...modifiers(geometry)];
}

export function guessGeometry(layout: string | null): Geometry {
	if (!layout) return 'ansi';
	const base = layout.split(/[(+]/)[0];
	if (base === 'jp') return 'jis';
	if (['us', 'cn', 'kr', 'th', 'il', 'tw'].includes(base)) return 'ansi';
	return 'iso';
}
