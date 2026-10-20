import { urls } from '@luft/web';

export { formatSize, iso } from './iso';

export interface Download {
	file: string;
	href: string;
	checksum: string;
	size: number | null;
}

async function meetDownload(file: string): Promise<Download> {
	const href = `${urls.downloads}/meet/${file}`;
	const response = await fetch(href, { method: 'HEAD' }).catch(() => null);
	const size = response?.ok ? Number(response.headers.get('content-length')) : null;
	return { file, href, checksum: `${href}.sha256`, size };
}

const [windows, linux] = await Promise.all([meetDownload('meet-luft.exe'), meetDownload('meet-luft.AppImage')]);

export const meet = { windows, linux };
