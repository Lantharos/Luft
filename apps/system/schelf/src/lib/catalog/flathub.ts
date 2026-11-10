import { commands, type Permissions } from '#lib/bindings.js';
import { describe, type Access } from '#lib/app/permissions.js';
import type { AppDetails, Screenshot } from './types';

interface ScreenshotSize {
	width: string;
	src: string;
}

export interface Appstream {
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

export interface Summary {
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

export async function broadAccess(id: string, known: Permissions | null = null): Promise<Access[]> {
	const listed = known ?? permissions(await commands.flathubSummary({ id }).catch((): Summary => ({})));
	const access = listed ? describe(listed) : [];
	return access.some((entry) => entry.notable) ? access : [];
}

function verified(metadata: Appstream['metadata']): string | null {
	if (!metadata || String(metadata['flathub::verification::verified']) !== 'true') return null;
	const website = metadata['flathub::verification::website'];
	const login = metadata['flathub::verification::login_name'];
	return `Verified as ${typeof website === 'string' ? website : typeof login === 'string' ? login : 'Flathub'}`;
}

export async function details(id: string): Promise<AppDetails> {
	const [appstream, summary] = await Promise.all([
		commands.flathubAppstream({ id }),
		commands.flathubSummary({ id }).catch((): Summary => ({}))
	]);
	const release = appstream.releases?.find((entry) => entry.type !== 'development') ?? appstream.releases?.[0];
	return {
		id,
		origin: 'flathub',
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
		permissions: permissions(summary),
		store: null
	};
}
