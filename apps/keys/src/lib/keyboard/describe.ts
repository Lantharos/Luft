import { nameOf } from '$lib/characters/characters';
import type { Symbol } from '$lib/layout/api';

export const LEVEL_NAMES = ['Alone', 'With Shift', 'With AltGr', 'With Shift and AltGr'];

const DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function plainName(text: string) {
	if (/^[a-z]$/.test(text)) return `Latin small letter ${text}`;
	if (/^[A-Z]$/.test(text)) return `Latin capital letter ${text}`;
	if (/^[0-9]$/.test(text)) return `Digit ${DIGITS[Number(text)]}`;
	return null;
}

export async function describe(symbol: Symbol) {
	if (symbol.kind === 'character') return plainName(symbol.text) ?? (await nameOf(symbol.text)) ?? symbol.keysym.replaceAll('_', ' ');
	if (symbol.kind === 'dead') return `Dead key, ${symbol.keysym.replace('dead_', '').replaceAll('_', ' ')}`;
	if (symbol.kind === 'compose') return 'Starts a compose sequence';
	if (symbol.kind === 'function') return symbol.keysym.replaceAll('_', ' ');
	return 'Nothing';
}

export function shown(symbol: Symbol) {
	if (symbol.kind === 'compose') return '⎄';
	if (symbol.kind === 'empty') return '';
	return symbol.text;
}
