import type { ImageDocument } from '#lib/document/image.svelte.js';
import { Batch, Toggle } from '#lib/document/entries.js';
import { renderText } from '#lib/raster/text.js';
import { TileChange, type Entry } from '#lib/document/history.svelte.js';
import type { Layer } from '#lib/document/layers.svelte.js';
import type { Overlay } from '#lib/editor/overlay.js';
import { kit } from '#lib/gpu/kit.js';
import { apply, invert, multiply, rotation, scaling, translation, type Matrix } from '#lib/gpu/matrix.js';
import { newTile, TileGrid, type Rect } from '#lib/gpu/tiles.js';
import { assemble, Transformer } from '#lib/raster/transform.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface MoveHost {
	doc: ImageDocument;
	show(overlay: Overlay | null): void;
	handleRadius(): number;
	label: string;
}

type Grab = { kind: 'move' } | { kind: 'rotate'; start: number; angle: number } | { kind: 'scale' };

const LIFT = 3;
const CUT = 1;
const OVER = 2;
const ROTATE_SNAP = Math.PI / 12;

interface Session {
	layer: Layer;
	originals: Map<number, GPUTexture | undefined>;
	floating: TileGrid;
	bounds: Rect;
	selected: boolean;
	tx: number;
	ty: number;
	sx: number;
	sy: number;
	angle: number;
}

function bake(mode: number) {
	const params = new Float32Array(8);
	params[4] = 1;
	new Uint32Array(params.buffer)[5] = mode;
	return kit.uniform(params);
}

export class MoveTool implements ToolHandler {
	readonly cursor = 'move';
	#session = $state.raw<Session | null>(null);
	#grab: Grab | null = null;
	#start: [number, number] = [0, 0];
	#startState = { tx: 0, ty: 0, sx: 1, sy: 1, angle: 0 };

	constructor(private readonly host: MoveHost) {}

	get active() {
		return this.#session !== null;
	}

	#matrix(session: Session): Matrix {
		const cx = session.bounds.x + session.bounds.width / 2;
		const cy = session.bounds.y + session.bounds.height / 2;
		return [translation(cx + session.tx, cy + session.ty), rotation(session.angle), scaling(session.sx, session.sy), translation(-cx, -cy)].reduce(multiply);
	}

	#begin(): Session | null {
		const { doc } = this.host;
		const layer = doc.active;
		if (layer.locked || !layer.visible) return null;
		const selected = doc.selectionActive;
		const originals = new Map<number, GPUTexture | undefined>();
		const floating = new TileGrid(doc.width, doc.height);
		const indices = selected ? [...doc.selection.tiles.keys()] : [...layer.pixels.tiles.keys()];
		const lift = bake(LIFT);
		const cut = bake(CUT);
		for (const index of indices) {
			const original = layer.pixels.get(index);
			originals.set(index, original);
			if (!original) continue;
			const lifted = newTile();
			if (selected) {
				const mask = doc.selection.get(index)!.createView();
				kit.fill(lifted, kit.bake, [original.createView(), mask, kit.full, kit.clear, lift]);
				const holed = newTile();
				kit.fill(holed, kit.bake, [original.createView(), mask, kit.full, kit.clear, cut]);
				layer.pixels.set(index, holed);
			} else {
				kit.copy(original, lifted);
				layer.pixels.set(index, undefined);
			}
			floating.set(index, lifted);
		}
		const bounds = selected && doc.selectionBounds ? doc.selectionBounds : this.#contentBounds(floating);
		const session = { layer, originals, floating, bounds, selected, tx: 0, ty: 0, sx: 1, sy: 1, angle: 0 };
		doc.floating = { grid: floating, matrix: this.#matrix(session) };
		doc.invalidate(indices);
		return session;
	}

	#contentBounds(grid: TileGrid): Rect {
		let bounds: Rect | null = null;
		for (const index of grid.tiles.keys()) {
			const rect = grid.rectOf(index);
			bounds = bounds ? { x: Math.min(bounds.x, rect.x), y: Math.min(bounds.y, rect.y), width: Math.max(bounds.x + bounds.width, rect.x + rect.width) - Math.min(bounds.x, rect.x), height: Math.max(bounds.y + bounds.height, rect.y + rect.height) - Math.min(bounds.y, rect.y) } : rect;
		}
		return bounds ?? this.host.doc.bounds;
	}

	#corners(session: Session) {
		const matrix = this.#matrix(session);
		const { x, y, width, height } = session.bounds;
		return ([[x, y], [x + width, y], [x + width, y + height], [x, y + height]] as const).map(([px, py]) => apply(matrix, px, py));
	}

	#hit(session: Session, event: ToolEvent): Grab {
		const radius = this.host.handleRadius();
		const corners = this.#corners(session);
		if (corners.some(([cx, cy]) => Math.hypot(cx - event.x, cy - event.y) <= radius)) return { kind: 'scale' };
		const [lx, ly] = apply(invert(this.#matrix(session)), event.x, event.y);
		const { x, y, width, height } = session.bounds;
		const inside = lx >= x && ly >= y && lx <= x + width && ly <= y + height;
		if (inside) return { kind: 'move' };
		const cx = x + width / 2 + session.tx;
		const cy = y + height / 2 + session.ty;
		return { kind: 'rotate', start: Math.atan2(event.y - cy, event.x - cx), angle: session.angle };
	}

	down(event: ToolEvent) {
		this.#session ??= this.#begin();
		const session = this.#session;
		if (!session) return;
		this.#grab = this.#hit(session, event);
		this.#start = [event.x, event.y];
		this.#startState = { tx: session.tx, ty: session.ty, sx: session.sx, sy: session.sy, angle: session.angle };
		this.#show();
	}

	move(event: ToolEvent) {
		const session = this.#session;
		const grab = this.#grab;
		if (!session || !grab) return;
		const start = this.#startState;
		const dx = event.x - this.#start[0];
		const dy = event.y - this.#start[1];
		if (grab.kind === 'move' || session.layer.text) {
			session.tx = start.tx + dx;
			session.ty = start.ty + dy;
		} else if (grab.kind === 'rotate') {
			const cx = session.bounds.x + session.bounds.width / 2 + session.tx;
			const cy = session.bounds.y + session.bounds.height / 2 + session.ty;
			let angle = grab.angle + Math.atan2(event.y - cy, event.x - cx) - grab.start;
			if (event.shift) angle = Math.round(angle / ROTATE_SNAP) * ROTATE_SNAP;
			session.angle = angle;
		} else {
			const cx = session.bounds.x + session.bounds.width / 2 + session.tx;
			const cy = session.bounds.y + session.bounds.height / 2 + session.ty;
			const [lx, ly] = apply(rotation(-session.angle), event.x - cx, event.y - cy);
			let sx = Math.max(0.01, Math.abs(lx) / Math.max(1, session.bounds.width / 2));
			let sy = Math.max(0.01, Math.abs(ly) / Math.max(1, session.bounds.height / 2));
			if (!event.shift) {
				const factor = Math.max(sx / start.sx, sy / start.sy);
				sx = start.sx * factor;
				sy = start.sy * factor;
			}
			session.sx = sx;
			session.sy = sy;
		}
		this.host.doc.floating = { grid: session.floating, matrix: this.#matrix(session) };
		this.host.doc.onchange();
		this.#show();
	}

	up() {
		this.#grab = null;
	}

	key(event: KeyboardEvent) {
		const session = this.#session;
		if (event.key === 'Enter') return this.commit(), true;
		if (event.key === 'Escape') return this.cancel(), true;
		const step = event.shiftKey ? 10 : 1;
		const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
		const nudge = moves[event.key];
		if (!nudge) return false;
		const target = session ?? (this.#session = this.#begin());
		if (!target) return false;
		target.tx += nudge[0];
		target.ty += nudge[1];
		this.host.doc.floating = { grid: target.floating, matrix: this.#matrix(target) };
		this.host.doc.onchange();
		this.#show();
		return true;
	}

	#show() {
		const session = this.#session;
		if (!session) return this.host.show(null);
		const { x, y, width, height } = session.bounds;
		this.host.show({ kind: 'transform', x, y, width, height, matrix: this.#matrix(session) });
	}

	cancel() {
		const session = this.#session;
		if (!session) return;
		this.#session = null;
		const { doc } = this.host;
		for (const [index, original] of session.originals) {
			const current = session.layer.pixels.get(index);
			if (current !== original) current?.destroy();
			session.layer.pixels.set(index, original);
		}
		kit.flush();
		session.floating.destroy();
		doc.floating = null;
		doc.invalidate();
		this.host.show(null);
	}

	commit() {
		const session = this.#session;
		if (!session) return;
		this.#session = null;
		const { doc } = this.host;
		const matrix = this.#matrix(session);
		const unchanged = session.tx === 0 && session.ty === 0 && session.sx === 1 && session.sy === 1 && session.angle === 0;
		if (unchanged) return this.cancel();
		if (session.layer.text) return this.#moveText(session);
		const corners = this.#corners(session);
		const xs = corners.map(([cx]) => cx);
		const ys = corners.map(([, cy]) => cy);
		const covered = session.layer.pixels.indicesIn({ x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) });
		const indices = new Set([...session.originals.keys(), ...covered]);
		const source = assemble(session.floating);
		const transformer = new Transformer(source);
		const over = bake(OVER);
		const changes = new Map<number, [GPUTexture | undefined, GPUTexture | undefined]>();
		const scratch = newTile();
		for (const index of indices) {
			const rect = session.layer.pixels.rectOf(index);
			const base = session.layer.pixels.get(index);
			const before = session.originals.has(index) ? session.originals.get(index) : base;
			transformer.render(matrix, scratch, [rect.x, rect.y]);
			const after = newTile();
			kit.fill(after, kit.bake, [base?.createView() ?? kit.clear, kit.full, kit.full, scratch.createView(), over]);
			if (base && base !== before) base.destroy();
			session.layer.pixels.set(index, after);
			changes.set(index, [before, after]);
		}
		const parts: Entry[] = [new TileChange(this.host.label, session.layer.pixels, changes, (changed) => doc.invalidate(changed))];
		if (session.selected) parts.push(this.#moveSelection(matrix));
		doc.record(new Batch(this.host.label, parts));
		transformer.destroy();
		scratch.destroy();
		session.floating.destroy();
		session.layer.touch();
		doc.floating = null;
		doc.invalidate();
		this.host.show(null);
	}

	#moveText(session: Session) {
		this.#session = session;
		this.cancel();
		const { layer } = session;
		const before = layer.text!;
		const after = { ...before, x: before.x + session.tx, y: before.y + session.ty };
		layer.text = after;
		const pixels = renderText(this.host.doc, layer, after, this.host.label);
		this.host.doc.record(new Batch(this.host.label, [pixels, new Toggle(this.host.label, (forward) => (layer.text = forward ? after : before))]));
	}

	#moveSelection(matrix: Matrix) {
		const { doc } = this.host;
		const source = assemble(doc.selection);
		const transformer = new Transformer(source);
		const corners = doc.selectionBounds!;
		const moved = [apply(matrix, corners.x, corners.y), apply(matrix, corners.x + corners.width, corners.y), apply(matrix, corners.x, corners.y + corners.height), apply(matrix, corners.x + corners.width, corners.y + corners.height)];
		const xs = moved.map(([x]) => x);
		const ys = moved.map(([, y]) => y);
		const bounds = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
		const indices = new Set([...doc.selection.tiles.keys(), ...doc.selection.indicesIn(bounds)]);
		const change = doc.tileChange(this.host.label, doc.selection, [...indices], (index, target) => {
			const rect = doc.selection.rectOf(index);
			transformer.render(matrix, target, [rect.x, rect.y]);
		});
		const before = doc.selectionBounds;
		doc.selectionBounds = bounds;
		transformer.destroy();
		return new Batch(this.host.label, [change, { label: this.host.label, bytes: 0, undo: () => (doc.selectionBounds = before), redo: () => (doc.selectionBounds = bounds) }]);
	}
}
