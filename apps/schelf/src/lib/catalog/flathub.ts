import type { Backend, Permissions, Screenshot } from '$lib/bridge/types';
import type { AppDetails, CatalogApp, Page } from './types';
import type { CategoryId } from './categories';

export type Collection = 'popular' | 'trending' | 'recently-updated' | 'recently-added';

interface Hit {
	app_id: string;
	name: string;
	summary: string;
	icon: string | null;
	developer_name?: string | null;
}

interface HitPage {
	hits: Hit[];
	totalPages: number;
}

interface ScreenshotSize {
	width: string;
	src: string;
}

interface Appstream {
	id: string;
	name: string;
	summary: string;
	description: string;
	icon: string | null;
	developer_name: string | null;
	project_license: string | null;
	urls: Record<string, string | null> | null;
	screenshots?: { caption?: string | null; sizes: ScreenshotSize[] }[];
	releases?: { version: string; timestamp: string | null; description: string | null; type?: string }[];
	metadata?: Record<string, string | boolean | null> | null;
}

interface Summary {
	download_size?: number;
	installed_size?: number;
	metadata?: {
		permissions?: {
			shared?: string[];
			sockets?: string[];
			devices?: string[];
			filesystems?: string[];
			'session-bus'?: { talk?: string[]; own?: string[] };
			'system-bus'?: { talk?: string[]; own?: string[] };
		};
	};
}

const PREFERRED_WIDTH = 752;
export const PAGE_SIZE = 48;

export function toApp(hit: Hit): CatalogApp {
	return {
		key: `flathub:${hit.app_id}`,
		origin: 'flathub',
		id: hit.app_id,
		name: hit.name,
		summary: hit.summary,
		icon: hit.icon,
		developer: hit.developer_name ?? null,
		package: null
	};
}

const toPage = (page: HitPage): Page => ({ apps: page.hits.map(toApp), pages: page.totalPages });

export const collection = (backend: Backend, name: Collection, page = 1, size = PAGE_SIZE) =>
	backend.flathub<HitPage>(`collection/${name}?page=${page}&per_page=${size}`).then(toPage);

export const category = (backend: Backend, id: CategoryId, page = 1) =>
	backend.flathub<HitPage>(`collection/category/${id}?page=${page}&per_page=${PAGE_SIZE}`).then(toPage);

export const search = (backend: Backend, query: string) => backend.flathubSearch<HitPage>(query).then((page) => page.hits.map(toApp));

function screenshot(entry: { caption?: string | null; sizes: ScreenshotSize[] }): Screenshot | null {
	const sizes = [...entry.sizes].sort((a, b) => Math.abs(Number(a.width) - PREFERRED_WIDTH) - Math.abs(Number(b.width) - PREFERRED_WIDTH));
	return sizes[0] ? { url: sizes[0].src, caption: entry.caption ?? null } : null;
}

function permissions(summary: Summary): Permissions | null {
	const listed = summary.metadata?.permissions;
	if (!listed) return null;
	const bus = (policy?: { talk?: string[]; own?: string[] }) => [...(policy?.talk ?? []), ...(policy?.own ?? [])];
	return {
		shared: listed.shared ?? [],
		sockets: listed.sockets ?? [],
		devices: listed.devices ?? [],
		filesystems: listed.filesystems ?? [],
		sessionBus: bus(listed['session-bus']),
		systemBus: bus(listed['system-bus'])
	};
}

function verified(metadata: Appstream['metadata']): string | null {
	if (!metadata?.['flathub::verification::verified']) return null;
	const website = metadata['flathub::verification::website'];
	const login = metadata['flathub::verification::login_name'];
	return typeof website === 'string' ? website : typeof login === 'string' ? login : 'Flathub';
}

export async function details(backend: Backend, id: string): Promise<AppDetails> {
	const [appstream, summary] = await Promise.all([
		backend.flathub<Appstream>(`appstream/${id}`),
		backend.flathub<Summary>(`summary/${id}`).catch(() => ({}) as Summary)
	]);
	const release = appstream.releases?.find((entry) => entry.type !== 'development') ?? appstream.releases?.[0];
	return {
		origin: 'flathub',
		id,
		name: appstream.name,
		summary: appstream.summary,
		description: appstream.description,
		icon: appstream.icon,
		developer: appstream.developer_name,
		license: appstream.project_license,
		homepage: appstream.urls?.homepage ?? null,
		screenshots: (appstream.screenshots ?? []).map(screenshot).filter((entry) => entry !== null),
		release: release
			? { version: release.version, date: release.timestamp ? Number(release.timestamp) : null, notes: release.description ?? '' }
			: null,
		downloadSize: summary.download_size ?? null,
		installedSize: summary.installed_size ?? null,
		verified: verified(appstream.metadata),
		package: null,
		permissions: permissions(summary)
	};
}
