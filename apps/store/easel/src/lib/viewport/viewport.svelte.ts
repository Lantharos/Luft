import type { Matrix } from '#lib/gpu/matrix.js';

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 64;
const FIT_MARGIN = 48;

export class Viewport {
	scale = $state(1);
	x = $state(0);
	y = $state(0);
	width = $state(0);
	height = $state(0);
	ratio = $state(1);
	onchange: () => void = () => {};
	#waiting: (() => void) | null = null;

	whenSized(run: () => void) {
		if (this.width) run();
		else this.#waiting = run;
	}

	matrix(): Matrix {
		const { scale, ratio } = this;
		return [scale * ratio, 0, 0, scale * ratio, this.x * ratio, this.y * ratio];
	}

	toDocument(localX: number, localY: number): [number, number] {
		return [(localX - this.x) / this.scale, (localY - this.y) / this.scale];
	}

	toScreen(x: number, y: number): [number, number] {
		return [x * this.scale + this.x, y * this.scale + this.y];
	}

	resize(width: number, height: number, ratio: number) {
		const [centerX, centerY] = this.toDocument(this.width / 2, this.height / 2);
		const first = this.width === 0;
		this.width = width;
		this.height = height;
		this.ratio = ratio;
		if (!first) this.centerOn(centerX, centerY);
		this.#waiting?.();
		this.#waiting = null;
		this.onchange();
	}

	centerOn(x: number, y: number) {
		this.x = this.width / 2 - x * this.scale;
		this.y = this.height / 2 - y * this.scale;
		this.onchange();
	}

	fit(width: number, height: number, upscale = false) {
		const fitting = Math.min((this.width - FIT_MARGIN * 2) / width, (this.height - FIT_MARGIN * 2) / height);
		this.scale = Math.max(MIN_ZOOM, upscale ? fitting : Math.min(1, fitting));
		this.centerOn(width / 2, height / 2);
	}

	actualSize(width: number, height: number) {
		this.scale = 1 / this.ratio;
		this.centerOn(width / 2, height / 2);
	}

	zoomAt(scale: number, localX: number, localY: number) {
		const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
		const [x, y] = this.toDocument(localX, localY);
		this.scale = next;
		this.x = localX - x * next;
		this.y = localY - y * next;
		this.onchange();
	}

	zoomBy(factor: number, localX = this.width / 2, localY = this.height / 2) {
		this.zoomAt(this.scale * factor, localX, localY);
	}

	panBy(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
		this.onchange();
	}
}
