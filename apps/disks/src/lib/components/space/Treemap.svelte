<script lang="ts">
	import { appearance } from '@luft/ui';
	import { bytes } from '$lib/format';
	import { mix, readPalette, type Palette } from './colors';
	import { squarify, type Rect } from './squarify';
	import type { Tile } from './tiles';

	interface Props {
		tiles: Tile[];
		hovered: string | null;
		onhover: (key: string | null) => void;
		onopen: (tile: Tile) => void;
	}

	let { tiles, hovered, onhover, onopen }: Props = $props();

	const HEIGHT = 300;
	const GAP = 1.5;
	const LABEL = 30;

	let host = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();
	let width = $state(0);
	let palette = $state.raw<Palette | null>(null);
	let fonts = $state(0);

	let rects = $derived(squarify(tiles.map((tile) => tile.size), { x: 0, y: 0, w: width, h: HEIGHT }));

	$effect(() => {
		void appearance.scheme;
		void appearance.colors;
		void appearance.pureBlack;
		const frame = requestAnimationFrame(() => host && (palette = readPalette(host)));
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		void document.fonts.ready.then(() => (fonts += 1));
	});

	$effect(() => {
		void fonts;
		if (canvas && palette && width > 0) draw(canvas, palette);
	});

	function inset({ x, y, w, h }: Rect, amount: number): Rect {
		return { x: x + amount, y: y + amount, w: Math.max(0, w - amount * 2), h: Math.max(0, h - amount * 2) };
	}

	function fill(context: CanvasRenderingContext2D, rect: Rect, color: string, radius: number) {
		if (rect.w <= 0 || rect.h <= 0) return;
		context.fillStyle = color;
		context.beginPath();
		context.roundRect(rect.x, rect.y, rect.w, rect.h, Math.min(radius, rect.w / 2, rect.h / 2));
		context.fill();
	}

	function fitted(context: CanvasRenderingContext2D, text: string, room: number) {
		if (context.measureText(text).width <= room) return text;
		let end = text.length;
		while (end > 1 && context.measureText(`${text.slice(0, end)}…`).width > room) end -= 1;
		return `${text.slice(0, end)}…`;
	}

	function background(tile: Tile, colors: Palette, lit: boolean) {
		if (tile.kind === 'dir') return mix(colors.tones[tile.tone], lit ? 0.24 : 0.16);
		if (tile.kind === 'file') return mix(colors.ink, lit ? 0.15 : 0.1);
		return mix(colors.ink, lit ? 0.09 : 0.05);
	}

	function drawTile(context: CanvasRenderingContext2D, tile: Tile, rect: Rect, colors: Palette) {
		const box = inset(rect, GAP);
		const lit = hovered === tile.key;
		fill(context, box, background(tile, colors, lit), 7);
		const labelled = box.w > 64 && box.h > 40;
		if (tile.kind === 'dir' && tile.inner.length) {
			const area = labelled ? { x: box.x + 6, y: box.y + LABEL, w: box.w - 12, h: box.h - LABEL - 6 } : inset(box, 4);
			const shown = tile.inner.reduce((sum, size) => sum + size, 0);
			const sizes = [...tile.inner, Math.max(0, tile.size - shown)];
			const inner = squarify(sizes, area);
			inner.slice(0, tile.inner.length).forEach((rect) => rect && fill(context, inset(rect, 1), mix(colors.tones[tile.tone], lit ? 0.42 : 0.32), 4));
		}
		if (!labelled) return;
		context.save();
		context.beginPath();
		context.rect(box.x, box.y, box.w, box.h);
		context.clip();
		const size = bytes(tile.size);
		context.font = '400 11.5px "Open Runde", sans-serif';
		const sizeWidth = context.measureText(size).width;
		const inline = tile.kind === 'dir';
		const room = box.w - 20 - (inline ? sizeWidth + 10 : 0);
		if (inline && room > 24) {
			context.fillStyle = colors.muted;
			context.fillText(size, box.x + box.w - 10 - sizeWidth, box.y + 19);
		} else if (!inline && box.h >= 56) {
			context.fillStyle = colors.muted;
			context.fillText(fitted(context, size, box.w - 20), box.x + 10, box.y + 36);
		}
		context.font = '500 12.5px "Open Runde", sans-serif';
		context.fillStyle = colors.text;
		context.fillText(fitted(context, tile.label, inline && room > 24 ? room : box.w - 20), box.x + 10, box.y + 19);
		context.restore();
	}

	function draw(target: HTMLCanvasElement, colors: Palette) {
		const scale = window.devicePixelRatio || 1;
		target.width = Math.round(width * scale);
		target.height = Math.round(HEIGHT * scale);
		const context = target.getContext('2d');
		if (!context) return;
		context.setTransform(scale, 0, 0, scale, 0, 0);
		context.clearRect(0, 0, width, HEIGHT);
		tiles.forEach((tile, index) => {
			const rect = rects[index];
			if (rect) drawTile(context, tile, rect, colors);
		});
	}

	function hit(event: PointerEvent | MouseEvent) {
		const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const [x, y] = [event.clientX - bounds.left, event.clientY - bounds.top];
		const index = rects.findIndex((rect) => rect && x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h);
		return index < 0 ? null : tiles[index];
	}
</script>

<div bind:this={host} bind:clientWidth={width} class="map">
	<canvas
		bind:this={canvas}
		class:pointer={hovered?.startsWith('dir:')}
		style:width="{width}px"
		style:height="{HEIGHT}px"
		aria-label="Sizes of what's in this folder"
		onpointermove={(event) => onhover(hit(event)?.key ?? null)}
		onpointerleave={() => onhover(null)}
		onclick={(event) => {
			const tile = hit(event);
			if (tile) onopen(tile);
		}}
	></canvas>
</div>

<style>
	.map {
		height: 300px;
		overflow: hidden;
		border-radius: 18px;
	}

	canvas {
		display: block;
	}

	.pointer {
		cursor: pointer;
	}
</style>
