import { i18n } from '@luft/i18n';
import { MiB } from './model';

const UNITS: Record<string, number> = {
	b: 1,
	k: 1000,
	kb: 1000,
	kib: 1024,
	m: MiB,
	mib: MiB,
	mb: 1000 ** 2,
	g: 1000 ** 3,
	gb: 1000 ** 3,
	gib: 1024 ** 3,
	t: 1000 ** 4,
	tb: 1000 ** 4,
	tib: 1024 ** 4
};

let wholeLocale = '';
let whole: Intl.NumberFormat;

export function mebibytes(bytes: number) {
	if (wholeLocale !== i18n.formats) {
		wholeLocale = i18n.formats;
		whole = new Intl.NumberFormat(wholeLocale);
	}
	return whole.format(Math.round(bytes / MiB));
}

export function unitOf(shown: string) {
	return UNITS[shown.split(' ').at(-1)?.toLowerCase() ?? ''] ?? MiB;
}

export function parseSize(text: string, fallback = MiB) {
	const match = /^\s*([\d\s.,]+?)\s*([a-z]*)\s*$/i.exec(text);
	if (!match) return null;
	const unit = match[2] ? UNITS[match[2].toLowerCase()] : fallback;
	const digits = match[1].replace(/\s/g, '');
	const decimal = digits.includes(',') && !digits.includes('.') && !/,\d{3}$/.test(digits) ? digits.replace(',', '.') : digits.replace(/,/g, '');
	const value = Number.parseFloat(decimal);
	if (unit === undefined || !Number.isFinite(value) || value < 0) return null;
	return Math.round((value * unit) / MiB) * MiB;
}
