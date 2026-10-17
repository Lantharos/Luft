import { urls } from '@luft/web';

export interface Download {
	file: string;
	href: string;
	checksum: string;
	size: number | null;
}

async function published(file: string): Promise<Download | null> {
	const href = `${urls.downloads}/${file}`;
	const response = await fetch(href, { method: 'HEAD' }).catch(() => null);
	if (!response?.ok) return null;
	return { file, href, checksum: `${href}.sha256`, size: Number(response.headers.get('content-length')) };
}

async function download(file: string): Promise<Download> {
	const href = `${urls.downloads}/${file}`;
	return (await published(file)) ?? { file, href, checksum: `${href}.sha256`, size: null };
}

async function edition(channel: 'latest' | 'nightly', fetchFile: (file: string) => Promise<Download | null>) {
	const [universal, standard, nvidia] = await Promise.all(
		['', '-standard', '-nvidia'].map((variant) => fetchFile(`luft-${channel}${variant}.iso`))
	);
	return universal && standard && nvidia && { channel, universal, standard, nvidia };
}

export type Edition = NonNullable<Awaited<ReturnType<typeof edition>>>;

const [release, nightly, windows, linux] = await Promise.all([
	edition('latest', published),
	edition('nightly', download),
	download('meet-luft.exe'),
	download('meet-luft.AppImage')
]);

export const iso: Edition = release ?? nightly!;
export const nightlyIso: Edition | null = release ? nightly : null;
export const meet = { windows, linux };

export function formatSize(bytes: number) {
	const [amount, unit] = bytes >= 1e9 ? [bytes / 1e9, 'GB'] : [bytes / 1e6, 'MB'];
	return `${amount.toLocaleString('en', { maximumFractionDigits: amount < 10 ? 1 : 0 })} ${unit}`;
}
