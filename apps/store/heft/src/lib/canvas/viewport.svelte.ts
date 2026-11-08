import type { Layout } from './layout';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 6;
const OVERSCROLL = 120;

/** Where the notebook is scrolled and how far it is zoomed, in screen pixels. */
export class Viewport {
	width = $state(0);
	height = $state(0);
	zoom = $state(1);
	x = $state(0);
	y = $state(0);
	layout: Layout = $state.raw({ width: 0, height: 0, pages: [] });

	get contentWidth() {
		return this.layout.width * this.zoom;
	}

	get contentHeight() {
		return this.layout.height * this.zoom;
	}

	toContent(viewX: number, viewY: number): [number, number] {
		return [(viewX + this.x) / this.zoom, (viewY + this.y) / this.zoom];
	}

	toView(contentX: number, contentY: number): [number, number] {
		return [contentX * this.zoom - this.x, contentY * this.zoom - this.y];
	}

	clamp() {
		const spareX = this.width - this.contentWidth;
		this.x = spareX > 0 ? -spareX / 2 : Math.min(Math.max(this.x, 0), -spareX);
		const spareY = this.height - this.contentHeight;
		this.y = spareY > 0 ? -spareY / 2 : Math.min(Math.max(this.y, -OVERSCROLL), -spareY + OVERSCROLL);
	}

	panBy(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
		this.clamp();
	}

	zoomAt(zoom: number, viewX: number, viewY: number) {
		const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
		const [contentX, contentY] = this.toContent(viewX, viewY);
		this.zoom = next;
		this.x = contentX * next - viewX;
		this.y = contentY * next - viewY;
		this.clamp();
	}

	fitWidth(page: { width: number }, margin = 32) {
		const zoom = (this.width - margin * 2) / page.width;
		this.zoomAt(zoom, this.width / 2, 0);
	}

	fitPage(page: { width: number; height: number; top: number }, margin = 24) {
		const zoom = Math.min((this.width - margin * 2) / page.width, (this.height - margin * 2) / page.height);
		this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
		this.y = page.top * this.zoom - margin;
		this.clamp();
	}

	scrollToPage(page: { top: number }) {
		this.y = page.top * this.zoom - 16;
		this.clamp();
	}
}
