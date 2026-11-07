import { urls } from '@luft/web';

export { formatSize, iso } from './iso';

interface Latest {
	files: { platform: string; kind: string; size: number }[];
}

export interface Download {
	href: string;
	size: number | null;
}

const latest: Latest | null = await fetch(`${urls.meet}/latest.json`)
	.then((response) => (response.ok ? response.json() : null))
	.catch(() => null);

function meetDownload(platform: string, kind: string): Download {
	const file = latest?.files.find((candidate) => candidate.platform === platform && candidate.kind === kind);
	return { href: `${urls.meet}/latest/${platform}/${kind}`, size: file?.size ?? null };
}

export const meet = {
	windows: meetDownload('windows-x86_64', 'exe'),
	linux: meetDownload('linux-x86_64', 'app-image'),
	checksums: `${urls.meet}/latest/SHA256SUMS`
};
