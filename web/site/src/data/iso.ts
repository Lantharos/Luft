export const iso = {
	href: '/download/latest',
	checksum: '/download/latest.sha256',
	signature: '/download/latest.sha256.minisig',
	details: '/download/latest.json',
	nightly: '/download/nightly'
};

export function formatSize(bytes: number, locale: string) {
	const [amount, unit] = bytes >= 1e9 ? [bytes / 1e9, 'gigabyte'] : [bytes / 1e6, 'megabyte'];
	return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: amount < 10 ? 1 : 0 }).format(amount);
}
