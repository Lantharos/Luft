import { commands } from '#lib/bindings.js';
import type { Format } from '#lib/bindings.js';
import type { TileGrid } from '#lib/gpu/tiles.js';
import { tileBatches } from './pixels';

export const FORMATS: Format[] = ['png', 'jpeg', 'webp', 'avif'];
export const EXTENSIONS: Record<Format, string> = { png: 'png', jpeg: 'jpg', webp: 'webp', avif: 'avif' };
export const LOSSY = new Set<Format>(['jpeg', 'webp', 'avif']);

export function formatOf(path: string): Format | null {
	const extension = path.split('.').pop()!.toLowerCase();
	return extension === 'jpg' ? 'jpeg' : (FORMATS.find((format) => format === extension) ?? null);
}

export interface ExportRequest {
	path: string;
	format: Format;
	quality: number;
	width: number;
	height: number;
}

export async function exportGrid(grid: TileGrid, request: ExportRequest) {
	const id = await commands.exportBegin({ ...request, sourceWidth: grid.width, sourceHeight: grid.height });
	const sending: Promise<unknown>[] = [];
	for await (const { indices, body } of tileBatches(grid)) sending.push(commands.exportTiles({ id, indices }, { body }));
	await Promise.all(sending);
	await commands.exportCommit({ id });
}

export interface ExportChoice {
	format: Format | 'svg' | 'pdf';
	quality: number;
	scale: number;
}
