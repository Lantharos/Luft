import { commands } from '#lib/bindings.js';
import { BoardDocument, type Asset } from '#lib/board/board.svelte.js';
import { objectId, type BoardObject } from '#lib/board/model.js';
import { BoardRenderer } from '#lib/board/render/renderer.js';
import { PRINT } from '#lib/board/render/look.js';
import { boardBounds, boardSvg } from '#lib/board/svg.js';
import { kit } from '#lib/gpu/kit.js';
import { Compositor } from '#lib/gpu/compositor.js';
import { newTile, TILE, TileGrid } from '#lib/gpu/tiles.js';
import { exportGrid, type ExportRequest } from './export';
import { FORMAT, sendPreview } from './image-file.svelte';
import { fetchBytes } from './pixels';

const DISPLAY_SIDE = 2048;
const PADDING = 32;
const PREVIEW_SIDE = 1024;

export interface BoardRecord {
	format: number;
	kind: 'board';
	objects: BoardObject[];
	assets: Record<string, string>;
}

export async function loadAsset(bytes: Uint8Array<ArrayBuffer>, type: string): Promise<Asset> {
	const blob = new Blob([bytes], { type });
	const probe = await createImageBitmap(blob);
	const scale = Math.min(1, DISPLAY_SIDE / Math.max(probe.width, probe.height));
	const bitmap = scale < 1 ? await createImageBitmap(probe, { resizeWidth: Math.round(probe.width * scale), resizeHeight: Math.round(probe.height * scale), resizeQuality: 'high', premultiplyAlpha: 'premultiply' }) : probe;
	if (bitmap !== probe) probe.close();
	return { bytes, type, bitmap };
}

export async function addPicture(board: BoardDocument, bytes: Uint8Array<ArrayBuffer>, type: string, center: [number, number], label: string) {
	const id = objectId();
	const asset = await loadAsset(bytes, type);
	board.assets.set(id, asset);
	const scale = Math.min(1, 640 / Math.max(asset.bitmap.width, asset.bitmap.height));
	const w = asset.bitmap.width * scale;
	const h = asset.bitmap.height * scale;
	const picture: BoardObject = { id: objectId(), kind: 'picture', x: center[0] - w / 2, y: center[1] - h / 2, w, h, asset: id };
	board.commit(label, [...board.objects, picture]);
	board.select([picture.id]);
}

function rasterize(board: BoardDocument, scale: number) {
	const area = boardBounds(board.objects, board.lookup, PADDING);
	const width = Math.max(1, Math.round(area.w * scale));
	const height = Math.max(1, Math.round(area.h * scale));
	const grid = new TileGrid(width, height);
	const renderer = new BoardRenderer('rgba8unorm');
	const paper = [1, 1, 1, 1];
	for (const index of grid.all()) {
		const rect = grid.rectOf(index);
		const tile = newTile();
		const pass = kit.begin().beginRenderPass({ colorAttachments: [renderer.target(tile.createView(), TILE, TILE, 'rgba8unorm', paper)] });
		renderer.render(pass, { objects: board.objects, lookup: board.lookup, assets: board.assets }, [scale, 0, 0, scale, -area.x * scale - rect.x, -area.y * scale - rect.y], TILE, TILE, PRINT, new Set(), false);
		pass.end();
		kit.flush();
		grid.set(index, tile);
	}
	renderer.destroy();
	return grid;
}

export async function exportBoard(board: BoardDocument, request: Omit<ExportRequest, 'width' | 'height'>, scale: number) {
	const grid = rasterize(board, scale);
	try {
		await exportGrid(grid, { ...request, width: grid.width, height: grid.height });
	} finally {
		grid.destroy();
	}
}

export function boardSize(board: BoardDocument) {
	const area = boardBounds(board.objects, board.lookup, PADDING);
	return { width: Math.round(area.w), height: Math.round(area.h) };
}

export async function exportVector(board: BoardDocument, path: string, pdf: boolean) {
	const svg = boardSvg(board.objects, board.lookup, board.assets, PRINT, boardBounds(board.objects, board.lookup, PADDING));
	const body = new TextEncoder().encode(svg);
	await (pdf ? commands.exportPdf({ path }, { body }) : commands.exportFile({ path }, { body }));
}

export async function saveBoard(board: BoardDocument, path: string) {
	const used = new Set(board.objects.flatMap((object) => (object.kind === 'picture' ? [object.asset] : [])));
	const types: Record<string, string> = {};
	for (const id of used) types[id] = board.assets.get(id)!.type;
	const record: BoardRecord = { format: FORMAT, kind: 'board', objects: board.objects, assets: types };
	const id = await commands.saveBegin({ path, document: record as never });
	await Promise.all([...used].map((asset) => commands.saveAsset({ id, name: asset }, { body: board.assets.get(asset)!.bytes })));
	const area = boardBounds(board.objects, board.lookup, PADDING);
	const grid = rasterize(board, Math.min(1, PREVIEW_SIDE / Math.max(area.w, area.h)));
	const compositor = new Compositor(grid.width, grid.height);
	compositor.render(grid.tiles.keys(), [{ kind: 'pixels', pixels: grid, mask: null, opacity: 1, blend: 'normal', visible: true, stroke: null, adjust: null }], null);
	await sendPreview(id, { width: grid.width, height: grid.height, compositor });
	compositor.destroy();
	grid.destroy();
	await commands.saveCommit({ id });
	board.history.markSaved();
}

export async function openBoard(record: BoardRecord, files: { name: string; file: string }[]) {
	const board = new BoardDocument(record.objects);
	await Promise.all(
		files.map(async ({ name, file }) => {
			const type = record.assets[name];
			if (type) board.assets.set(name, await loadAsset(await fetchBytes(file), type));
		})
	);
	await commands.releaseFiles({ paths: files.map((entry) => entry.file) });
	return board;
}
