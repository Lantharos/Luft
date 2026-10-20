export const iso = {
	href: '/download/latest',
	checksum: '/download/latest.sha256',
	signature: '/download/latest.sha256.minisig',
	details: '/download/latest.json',
	nightly: '/download/nightly'
};

export function formatSize(bytes: number) {
	const [amount, unit] = bytes >= 1e9 ? [bytes / 1e9, 'GB'] : [bytes / 1e6, 'MB'];
	return `${amount.toLocaleString('en', { maximumFractionDigits: amount < 10 ? 1 : 0 })} ${unit}`;
}
