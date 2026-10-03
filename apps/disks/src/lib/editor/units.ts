import { MiB } from './model';

const whole = new Intl.NumberFormat();
const UNITS: Record<string, number> = {
	'': MiB,
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

export function mebibytes(bytes: number) {
	return whole.format(Math.round(bytes / MiB));
}

export function parseSize(text: string) {
	const match = /^\s*([\d\s.,]+?)\s*([a-z]*)\s*$/i.exec(text);
	if (!match) return null;
	const unit = UNITS[match[2].toLowerCase()];
	const digits = match[1].replace(/\s/g, '');
	const decimal = digits.includes(',') && !digits.includes('.') && !/,\d{3}$/.test(digits) ? digits.replace(',', '.') : digits.replace(/,/g, '');
	const value = Number.parseFloat(decimal);
	if (unit === undefined || !Number.isFinite(value) || value < 0) return null;
	return Math.round((value * unit) / MiB) * MiB;
}
