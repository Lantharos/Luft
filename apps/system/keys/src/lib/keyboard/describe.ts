import { t } from '@luft/i18n';
import { nameOf } from '#lib/characters/characters.js';
import type { DeadKey, Symbol } from '#lib/bindings.js';
import { standardName } from '#lib/layout/dead/table.js';

function plainName(text: string) {
	if (/^[a-z]$/.test(text)) return t('keys-character-small', { letter: text });
	if (/^[A-Z]$/.test(text)) return t('keys-character-capital', { letter: text });
	if (/^[0-9]$/.test(text)) return t('keys-character-digit', { digit: Number(text) });
	return null;
}

export async function describe(symbol: Symbol, dead: DeadKey[] = []) {
	if (symbol.kind === 'character') return plainName(symbol.text) ?? (await nameOf(symbol.text)) ?? symbol.keysym.replaceAll('_', ' ');
	if (symbol.kind === 'dead') {
		const own = dead.find((key) => key.keysym === symbol.keysym);
		return own ? t('keys-symbol-dead-own', { name: own.name }) : t('keys-symbol-dead-standard', { name: standardName(symbol.keysym) });
	}
	if (symbol.kind === 'compose') return t('keys-symbol-compose');
	if (symbol.kind === 'function') return symbol.keysym.replaceAll('_', ' ');
	return t('keys-symbol-nothing');
}

export function shown(symbol: Symbol) {
	if (symbol.kind === 'compose') return '⎄';
	if (symbol.kind === 'empty') return '';
	return symbol.text;
}
