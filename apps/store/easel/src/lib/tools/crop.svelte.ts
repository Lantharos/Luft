import type { ImageDocument } from '#lib/document/image.svelte.js';
import { reshape } from '#lib/document/reshape.js';
import type { Overlay } from '#lib/editor/stage/overlay.js';
import { translation } from '#lib/gpu/matrix.js';
import type { Rect } from '#lib/gpu/tiles.js';
import type { ToolEvent, ToolHandler } from './tool';

export interface CropHost {
	doc: ImageDocument;
	show(overlay: Overlay | null): void;
	handleRadius(): number;
	label: string;
}

type Edges = { left: boolean; right: boolean; top: boolean; bottom: boolean };

const MIN_SIZE = 1;

export class CropTool implements ToolHandler {
	readonly cursor = 'crosshair';
	rect = $state<Rect | null>(null);
	ratio = $state<number | null>(null);
	#grab: { edges: Edges | null; start: [number, number]; rect: Rect } | null = null;

	constructor(private readonly host: CropHost) {}

	start() {
		this.rect = this.host.doc.bounds;
		this.#show();
	}

	setRatio(ratio: number | null) {
		this.ratio = ratio;
		if (!ratio || !this.rect) return;
		const { doc } = this.host;
		const width = Math.min(doc.width, doc.height * ratio);
		const height = width / ratio;
		this.rect = { x: (doc.width - width) / 2, y: (doc.height - height) / 2, width, height };
		this.#show();
	}

	#edges(event: ToolEvent, rect: Rect): Edges | null {
		const radius = this.host.handleRadius();
		const near = (value: number, target: number) => Math.abs(value - target) <= radius;
		const insideX = event.x >= rect.x - radius && event.x <= rect.x + rect.width + radius;
		const insideY = event.y >= rect.y - radius && event.y <= rect.y + rect.height + radius;
		const edges = {
			left: insideY && near(event.x, rect.x),
			right: insideY && near(event.x, rect.x + rect.width),
			top: insideX && near(event.y, rect.y),
			bottom: insideX && near(event.y, rect.y + rect.height)
		};
		return Object.values(edges).some(Boolean) ? edges : null;
	}

	down(event: ToolEvent) {
		const rect = this.rect ?? this.host.doc.bounds;
		const edges = this.#edges(event, rect);
		const inside = event.x > rect.x && event.y > rect.y && event.x < rect.x + rect.width && event.y < rect.y + rect.height;
		this.#grab = { edges: edges ?? (inside ? null : { left: false, right: true, top: false, bottom: true }), start: [event.x, event.y], rect: edges || inside ? rect : { x: event.x, y: event.y, width: 0, height: 0 } };
	}

	move(event: ToolEvent) {
		const grab = this.#grab;
		if (!grab) return;
		const { doc } = this.host;
		const dx = event.x - grab.start[0];
		const dy = event.y - grab.start[1];
		let { x, y, width, height } = grab.rect;
		if (!grab.edges) {
			x = Math.min(doc.width - width, Math.max(0, x + dx));
			y = Math.min(doc.height - height, Math.max(0, y + dy));
		} else {
			let left = x;
			let top = y;
			let right = x + width;
			let bottom = y + height;
			if (grab.edges.left) left += dx;
			if (grab.edges.right) right += dx;
			if (grab.edges.top) top += dy;
			if (grab.edges.bottom) bottom += dy;
			left = Math.max(0, Math.min(left, doc.width));
			right = Math.max(0, Math.min(right, doc.width));
			top = Math.max(0, Math.min(top, doc.height));
			bottom = Math.max(0, Math.min(bottom, doc.height));
			x = Math.min(left, right);
			y = Math.min(top, bottom);
			width = Math.abs(right - left);
			height = Math.abs(bottom - top);
			if (this.ratio) {
				if (grab.edges.top || grab.edges.bottom) width = Math.min(height * this.ratio, doc.width - x);
				height = Math.min(width / this.ratio, doc.height - y);
				width = height * this.ratio;
			}
		}
		this.rect = { x, y, width, height };
		this.#show();
	}

	up() {
		this.#grab = null;
	}

	key(event: KeyboardEvent) {
		if (event.key === 'Enter') return this.commit(), true;
		if (event.key === 'Escape') return this.cancel(), true;
		return false;
	}

	#show() {
		this.host.show(this.rect ? { kind: 'crop', rect: this.rect } : null);
	}

	cancel() {
		this.rect = null;
		this.host.show(null);
	}

	commit() {
		const rect = this.rect;
		this.cancel();
		if (!rect) return;
		const { doc } = this.host;
		const x = Math.round(rect.x);
		const y = Math.round(rect.y);
		const width = Math.max(MIN_SIZE, Math.round(rect.width));
		const height = Math.max(MIN_SIZE, Math.round(rect.height));
		if (x === 0 && y === 0 && width === doc.width && height === doc.height) return;
		reshape(doc, this.host.label, width, height, translation(-x, -y));
	}
}
