import { arrangement } from '#lib/app/arrangement.svelte.js';
import type { Layout } from './layout';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 6;
const OVERSCROLL = 120;
const PAGE_MARGIN = 24;
const PUSH_TO_TURN = 160;

export class Viewport {
	width = $state(0);
	height = $state(0);
	zoom = $state(1);
	x = $state(0);
	y = $state(0);
	single: number | null = $state(null);
	layout: Layout = $state.raw({ width: 0, height: 0, pages: [] });
	private push = 0;

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
		const page = this.single === null ? null : this.layout.pages[this.single];
		const margin = arrangement.tablet ? 0 : PAGE_MARGIN;
		const [top, bottom] = page ? [page.top * this.zoom - margin, (page.top + page.height) * this.zoom + margin] : [0, this.contentHeight];
		const overscroll = page ? 0 : OVERSCROLL;
		const spareY = this.height - (bottom - top);
		this.y = spareY > 0 ? top - (arrangement.tablet ? 0 : spareY / 2) : Math.min(Math.max(this.y, top - overscroll), bottom - this.height + overscroll);
	}

	panBy(dx: number, dy: number) {
		const before = this.y;
		this.x += dx;
		this.y += dy;
		this.clamp();
		if (this.single === null || this.y !== before || !dy) {
			this.push = 0;
			return;
		}
		this.push = Math.sign(dy) === Math.sign(this.push) ? this.push + dy : dy;
		if (Math.abs(this.push) >= PUSH_TO_TURN) this.turn(Math.sign(this.push));
	}

	zoomAt(zoom: number, viewX: number, viewY: number) {
		const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
		const [contentX, contentY] = this.toContent(viewX, viewY);
		this.zoom = next;
		this.x = contentX * next - viewX;
		this.y = contentY * next - viewY;
		this.clamp();
	}

	fitWidth(page: { left: number; width: number }, margin = arrangement.margin) {
		const zoom = (this.width - margin * 2) / page.width;
		this.zoomAt(zoom, this.width / 2, 0);
		this.x = page.left * this.zoom - margin;
		this.clamp();
	}

	fitPage(page: { width: number; height: number; top: number }, margin = 24) {
		const zoom = Math.min((this.width - margin * 2) / page.width, (this.height - margin * 2) / page.height);
		this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
		this.y = page.top * this.zoom - margin;
		this.clamp();
	}

	showPage(index: number) {
		const page = this.layout.pages[index];
		if (!page) return;
		if (this.single !== null) this.single = index;
		this.push = 0;
		this.y = page.top * this.zoom - 16;
		this.clamp();
	}

	turn(by: number) {
		if (this.single === null) return;
		const index = Math.min(this.layout.pages.length - 1, Math.max(0, this.single + by));
		if (index === this.single) return;
		this.showPage(index);
		if (by < 0) this.y = Infinity;
		this.clamp();
	}

	setSingle(index: number | null) {
		this.single = index;
		this.push = 0;
		this.clamp();
	}
}
