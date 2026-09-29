import { createReadStream, readdirSync, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, join } from 'node:path';
import type { Plugin } from 'vite';

const KINDS: Record<string, string> = {};
for (const extension of ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp']) KINDS[extension] = 'image';
for (const extension of ['mp4', 'm4v', 'webm', 'mkv', 'mov', 'ogv']) KINDS[extension] = 'video';
for (const extension of ['mp3', 'flac', 'ogg', 'oga', 'opus', 'wav', 'm4a', 'aac']) KINDS[extension] = 'audio';
KINDS.pdf = 'document';

const TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.svg': 'image/svg+xml',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.opus': 'audio/ogg',
	'.flac': 'audio/flac',
	'.wav': 'audio/wav',
	'.pdf': 'application/pdf'
};

function listing(folder: string) {
	const names = readdirSync(folder).filter((name) => !name.startsWith('.'));
	const folders = names.filter((name) => statSync(join(folder, name)).isDirectory()).map((name) => ({ path: join(folder, name), name }));
	const items = names
		.filter((name) => KINDS[extname(name).slice(1).toLowerCase()])
		.map((name) => {
			const path = join(folder, name);
			const stats = statSync(path);
			return { path, name, kind: KINDS[extname(name).slice(1).toLowerCase()], native: false, modified: stats.mtimeMs, size: stats.size };
		});
	return { folder, items, folders };
}

function answer(command: string, params: Record<string, unknown>) {
	if (command === 'app_state') return { translucent: false, palette: null, scheme: 'dark', launchPaths: process.env.MAGPIE_OPEN ? [process.env.MAGPIE_OPEN] : [] };
	if (command === 'open_folder') return listing(String(params.path));
	if (command === 'places') return process.env.MAGPIE_PLACES ? [{ place: 'pictures', path: process.env.MAGPIE_PLACES }] : [];
	if (command === 'audio_tags') return (params.paths as string[]).map((path) => ({ path, duration: null, art: null }));
	if (command === 'video_info') return { video: null, audio: null, subtitles: [] };
	if (command === 'image_details') return {};
	if (command === 'other_apps') return [];
	return null;
}

function serveFile(request: IncomingMessage, response: ServerResponse, path: string) {
	const { size } = statSync(path);
	const range = /bytes=(\d*)-(\d*)/.exec(request.headers.range ?? '');
	const start = range?.[1] ? Number(range[1]) : 0;
	const end = range?.[2] ? Number(range[2]) : size - 1;
	response.setHeader('Content-Type', TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream');
	response.setHeader('Accept-Ranges', 'bytes');
	response.setHeader('Content-Length', end - start + 1);
	if (range) {
		response.statusCode = 206;
		response.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
	}
	createReadStream(path, { start, end }).pipe(response);
}

export function preview(): Plugin {
	return {
		name: 'magpie-preview',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/__preview', (request, response) => {
				const url = new URL(request.url ?? '/', 'http://preview');
				if (url.pathname === '/file') return serveFile(request, response, url.searchParams.get('path') ?? '');
				let body = '';
				request.on('data', (chunk) => (body += chunk));
				request.on('end', () => {
					response.setHeader('Content-Type', 'application/json');
					response.end(JSON.stringify(answer(url.pathname.slice(1), JSON.parse(body || '{}'))));
				});
			});
		}
	};
}
