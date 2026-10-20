import { urls } from '@luft/web';

export interface Download {
	file: string;
	href: string;
	checksum: string;
	size: number | null;
}

export interface Iso extends Download {
	signature: string;
}

interface Latest {
	name: string;
	size: number;
}

async function latestIso(channel: '1' | 'nightly'): Promise<Iso | null> {
	const response = await fetch(`${urls.downloads}/${channel}/latest.json`).catch(() => null);
	if (!response?.ok) return null;
	const { name, size }: Latest = await response.json();
	const href = `${urls.downloads}/${channel}/${name}`;
	return { file: name, href, size, checksum: `${href}.sha256`, signature: `${href}.sha256.minisig` };
}

async function meetDownload(file: string): Promise<Download> {
	const href = `${urls.downloads}/meet/${file}`;
	const response = await fetch(href, { method: 'HEAD' }).catch(() => null);
	const size = response?.ok ? Number(response.headers.get('content-length')) : null;
	return { file, href, checksum: `${href}.sha256`, size };
}

const [release, nightly, windows, linux] = await Promise.all([
	latestIso('1'),
	latestIso('nightly'),
	meetDownload('meet-luft.exe'),
	meetDownload('meet-luft.AppImage')
]);

const newest = release ?? nightly;
if (!newest) throw new Error(`No ISO is published at ${urls.downloads}: neither 1/latest.json nor nightly/latest.json exists`);

export const iso: Iso = newest;
export const nightlyIso: Iso | null = release ? nightly : null;
export const meet = { windows, linux };

export function formatSize(bytes: number) {
	const [amount, unit] = bytes >= 1e9 ? [bytes / 1e9, 'GB'] : [bytes / 1e6, 'MB'];
	return `${amount.toLocaleString('en', { maximumFractionDigits: amount < 10 ? 1 : 0 })} ${unit}`;
}
