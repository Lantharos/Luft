import { home } from './language';

const DOWNLOADS = 'https://get.luft.computer';
const RELEASE = '1';
const NIGHTLY = 'nightly';
const POINTER_SECONDS = 300;
const ROUTE = /^\/download\/(latest|nightly)(\.json|\.sha256|\.sha256\.minisig)?$/;

interface Latest {
	name: string;
	version: string;
	size: number;
	sha256: string;
}

interface Found extends Latest {
	folder: string;
	url: string;
}

async function newest(folder: string): Promise<Found | null> {
	const response = await fetch(`${DOWNLOADS}/${folder}/latest.json`, {
		cf: { cacheTtl: POINTER_SECONDS, cacheEverything: true }
	});
	if (!response.ok) return null;
	const latest: Latest = await response.json();
	return { ...latest, folder, url: `${DOWNLOADS}/${folder}/${latest.name}` };
}

async function find(channel: string) {
	if (channel === NIGHTLY) return newest(NIGHTLY);
	return (await newest(RELEASE)) ?? newest(NIGHTLY);
}

export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);
		if (pathname === '/') return home(request, env.ASSETS);
		const route = pathname.match(ROUTE);
		if (!route) return env.ASSETS.fetch(request);
		const [, channel, part] = route;
		const found = await find(channel);
		if (!found) return new Response('No ISO is published yet.', { status: 404 });
		if (part === '.json') {
			return Response.json(found, { headers: { 'cache-control': `public, max-age=${POINTER_SECONDS}` } });
		}
		return Response.redirect(`${found.url}${part ?? ''}`, 302);
	}
} satisfies ExportedHandler<Env>;
