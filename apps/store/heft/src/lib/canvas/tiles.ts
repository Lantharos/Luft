import { overlaps, type Bounds, type Stroke } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';
import { paintStroke, paintStrokes, unwritten, type Ink, type Unwritten } from './ink-paint';

const TILE = 256;
const KEEP_AROUND = 2;

interface Tile {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	column: number;
	row: number;
}

const pool: HTMLCanvasElement[] = [];

function takeCanvas(): HTMLCanvasElement {
	const canvas = pool.pop() ?? document.createElement('canvas');
	canvas.className = 'ink-tile';
	return canvas;
}

export interface Visible {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export class TileLayer {
	private readonly tiles = new Map<string, Tile>();
	private zoom = 0;
	private scale = 0;
	private readonly stop: () => void;

	constructor(
		private readonly container: HTMLElement,
		private readonly document: PageDocument,
		private ink: Ink
	) {
		this.stop = document.listen((dirty, change) => {
			const topmost = document.strokes.length - change.added.length;
			const onTop = !change.removed.length && change.added.every((stroke) => stroke.tool !== 'highlighter' && document.strokes.indexOf(stroke) >= topmost);
			if (onTop) change.added.forEach((stroke) => this.add(stroke));
			else this.invalidate(dirty);
		});
	}

	setInk(ink: Ink) {
		this.ink = { ...ink, unwritten: this.ink.unwritten };
		for (const tile of this.tiles.values()) this.paint(tile);
	}

	setUnwritten(next: Unwritten | null) {
		const before = this.ink;
		const after = { ...before, unwritten: next };
		const flipped = this.document.strokes.filter((stroke) => unwritten(stroke, before) !== unwritten(stroke, after));
		this.ink = after;
		if (!flipped.length) return;
		for (const tile of this.tiles.values()) {
			const area = this.area(tile);
			if (flipped.some((stroke) => overlaps(stroke.bounds, area))) this.paint(tile);
		}
	}

	update(zoom: number, scale: number, visible: Visible) {
		if (zoom !== this.zoom || scale !== this.scale) {
			this.zoom = zoom;
			this.scale = scale;
			for (const tile of this.tiles.values()) this.release(tile);
			this.tiles.clear();
		}
		const first = { column: Math.floor(visible.left / TILE), row: Math.floor(visible.top / TILE) };
		const last = { column: Math.floor((visible.right - 1) / TILE), row: Math.floor((visible.bottom - 1) / TILE) };
		for (const [key, tile] of this.tiles) {
			const far =
				tile.column < first.column - KEEP_AROUND ||
				tile.column > last.column + KEEP_AROUND ||
				tile.row < first.row - KEEP_AROUND ||
				tile.row > last.row + KEEP_AROUND;
			if (far) {
				this.release(tile);
				this.tiles.delete(key);
			}
		}
		for (let row = first.row; row <= last.row; row++) {
			for (let column = first.column; column <= last.column; column++) {
				const key = `${column}:${row}`;
				if (!this.tiles.has(key)) this.tiles.set(key, this.create(column, row));
			}
		}
	}

	private add(stroke: Stroke) {
		for (const tile of this.tiles.values()) {
			if (!overlaps(stroke.bounds, this.area(tile))) continue;
			this.prepare(tile);
			paintStroke(tile.context, stroke, this.ink);
		}
	}

	private invalidate(dirty: Bounds) {
		for (const tile of this.tiles.values()) {
			if (overlaps(dirty, this.area(tile))) this.paint(tile);
		}
	}

	destroy() {
		this.stop();
		for (const tile of this.tiles.values()) this.release(tile);
		this.tiles.clear();
	}

	private area(tile: Tile): Bounds {
		return {
			left: (tile.column * TILE) / this.zoom,
			top: (tile.row * TILE) / this.zoom,
			right: ((tile.column + 1) * TILE) / this.zoom,
			bottom: ((tile.row + 1) * TILE) / this.zoom
		};
	}

	private create(column: number, row: number): Tile {
		const canvas = takeCanvas();
		const pixels = Math.ceil(TILE * this.scale);
		canvas.width = pixels;
		canvas.height = pixels;
		canvas.style.transform = `translate(${column * TILE}px, ${row * TILE}px)`;
		const context = canvas.getContext('2d')!;
		const tile = { canvas, context, column, row };
		this.paint(tile);
		this.container.append(canvas);
		return tile;
	}

	private prepare(tile: Tile) {
		const factor = this.zoom * this.scale;
		tile.context.setTransform(factor, 0, 0, factor, -tile.column * TILE * this.scale, -tile.row * TILE * this.scale);
	}

	private paint(tile: Tile) {
		tile.context.setTransform(1, 0, 0, 1, 0, 0);
		tile.context.clearRect(0, 0, tile.canvas.width, tile.canvas.height);
		this.prepare(tile);
		paintStrokes(tile.context, this.document.strokes, this.area(tile), this.ink);
	}

	private release(tile: Tile) {
		tile.canvas.remove();
		pool.push(tile.canvas);
	}
}
