import { arrowPath, bounds, FRAME_BAND, LINE_HEIGHT } from './geometry';
import { FRAME_TITLE_SIZE, LABEL_SIZE, NOTE_PADDING, NOTE_TEXT_SIZE, type BoardObject, type Box } from './model';
import type { Asset } from './board.svelte';
import { measureLabel } from './render/labels';
import { resolve, type Look } from './render/look';
import type { Rgba } from '#lib/raster/color.js';
import { arrowHead } from '#lib/raster/shapes.js';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paint = ([r, g, b, a]: Rgba) => `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${a})`;

function base64(bytes: Uint8Array) {
	let binary = '';
	for (let at = 0; at < bytes.length; at += 0x8000) binary += String.fromCharCode(...bytes.subarray(at, at + 0x8000));
	return btoa(binary);
}

function lines(text: string, size: number, weight: number, width: number | null) {
	return measureLabel({ text, size, weight, width, color: '', align: 'left' }).lines;
}

function textBlock(text: string, x: number, y: number, size: number, weight: number, color: string, width: number | null, center = false) {
	const rows = lines(text, size, weight, width);
	const anchor = center ? ' text-anchor="middle"' : '';
	return rows.map((row, index) => `<text x="${center && width ? x + width / 2 : x}" y="${y + (index + 0.5) * size * LINE_HEIGHT}" dominant-baseline="central" font-family="Open Runde, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}"${anchor}>${escape(row)}</text>`).join('');
}

function element(object: BoardObject, look: Look, lookup: (id: string) => BoardObject | undefined, assets: Map<string, Asset>): string {
	switch (object.kind) {
		case 'stroke': {
			const points: string[] = [];
			for (let at = 0; at < object.points.length; at += 3) points.push(`${object.points[at]},${object.points[at + 1]}`);
			const opacity = object.tool === 'highlighter' ? ' stroke-opacity="0.38"' : '';
			return `<polyline points="${points.join(' ')}" fill="none" stroke="${resolve(object.color, look)}" stroke-width="${object.width}" stroke-linecap="round" stroke-linejoin="round"${opacity}/>`;
		}
		case 'arrow': {
			const path = arrowPath(object, lookup);
			const stroke = `fill="none" stroke="${resolve(object.color, look)}" stroke-width="${object.width}" stroke-linecap="round" stroke-linejoin="round"`;
			const head = object.head ? `<polyline points="${arrowHead(path[path.length - 2], path[path.length - 1], object.width).map((point) => point.join(',')).join(' ')}" ${stroke}/>` : '';
			return `<polyline points="${path.map((point) => point.join(',')).join(' ')}" ${stroke}/>${head}`;
		}
		case 'frame':
			return `<rect x="${object.x}" y="${object.y}" width="${object.w}" height="${object.h}" rx="12" fill="${paint(look.frame)}" stroke="${paint(look.frameLine)}"/>${textBlock(object.text, object.x + 2, object.y - FRAME_BAND, FRAME_TITLE_SIZE, 600, look.frameTitle, null)}`;
		case 'shape': {
			const { x, y, w, h } = object;
			const paint = `fill="${object.fill ? resolve(object.fill, look) : 'none'}" stroke="${resolve(object.color, look)}" stroke-width="2"`;
			const outline =
				object.shape === 'ellipse'
					? `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" ${paint}/>`
					: object.shape === 'diamond'
						? `<polygon points="${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}" ${paint}/>`
						: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ${paint}/>`;
			const rows = lines(object.text, LABEL_SIZE, 600, Math.max(LABEL_SIZE, w - 20)).length;
			return outline + (object.text ? textBlock(object.text, x + 10, y + h / 2 - (rows * LABEL_SIZE * LINE_HEIGHT) / 2, LABEL_SIZE, 600, resolve(object.color, look), w - 20, true) : '');
		}
		case 'note':
			return `<rect x="${object.x}" y="${object.y}" width="${object.w}" height="${object.h}" rx="10" fill="${object.color}"/>${textBlock(object.text, object.x + NOTE_PADDING, object.y + NOTE_PADDING, NOTE_TEXT_SIZE, 500, look.noteText, object.w - NOTE_PADDING * 2)}`;
		case 'text':
			return textBlock(object.text, object.x, object.y, object.size, 500, resolve(object.color, look), null);
		case 'picture': {
			const asset = assets.get(object.asset);
			return asset ? `<image x="${object.x}" y="${object.y}" width="${object.w}" height="${object.h}" preserveAspectRatio="none" href="data:${asset.type};base64,${base64(asset.bytes)}"/>` : '';
		}
	}
}

export function boardBounds(objects: BoardObject[], lookup: (id: string) => BoardObject | undefined, padding: number): Box {
	const boxes = objects.map((object) => bounds(object, lookup));
	if (!boxes.length) return { x: 0, y: 0, w: 640, h: 400 };
	const x = Math.min(...boxes.map((box) => box.x)) - padding;
	const y = Math.min(...boxes.map((box) => box.y)) - padding;
	return { x, y, w: Math.max(...boxes.map((box) => box.x + box.w)) + padding - x, h: Math.max(...boxes.map((box) => box.y + box.h)) + padding - y };
}

export function boardSvg(objects: BoardObject[], lookup: (id: string) => BoardObject | undefined, assets: Map<string, Asset>, look: Look, area: Box) {
	const body = objects.map((object) => element(object, look, lookup, assets)).join('\n');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(area.w)}" height="${Math.ceil(area.h)}" viewBox="${area.x} ${area.y} ${area.w} ${area.h}">\n<rect x="${area.x}" y="${area.y}" width="${area.w}" height="${area.h}" fill="${look.paper}"/>\n${body}\n</svg>\n`;
}
