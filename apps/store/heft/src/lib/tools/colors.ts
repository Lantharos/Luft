import { t } from '@luft/i18n';
import { SWATCHES } from './tools.svelte';

const NAMES = [
	'pen-color-black',
	'pen-color-gray',
	'pen-color-blue',
	'pen-color-sky',
	'pen-color-red',
	'pen-color-orange',
	'pen-color-green',
	'pen-color-purple',
	'pen-color-yellow',
	'pen-color-lime',
	'pen-color-pink',
	'pen-color-cyan'
] as const;

export function colorName(color: number): string {
	const index = SWATCHES.indexOf(color);
	return index < 0 ? t('pen-color-other') : t(NAMES[index]);
}
