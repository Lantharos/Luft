<script lang="ts">
	import type { RenderTask } from 'pdfjs-dist';
	import { pdfDocument, PAGE_UNITS_PER_POINT } from './document';

	let { path, index, width, zoom, scale }: { path: string; index: number; width: number; zoom: number; scale: number } = $props();

	const MAX_PIXELS = 4096;
	const SETTLE = 120;

	let canvas: HTMLCanvasElement;
	let shown = $state(false);

	$effect(() => {
		const pixels = Math.min(MAX_PIXELS, Math.round(width * zoom * scale));
		let task: RenderTask | null = null;
		let alive = true;
		const timer = setTimeout(
			async () => {
				const document = await pdfDocument(path);
				const page = await document.getPage(index + 1);
				if (!alive) return;
				const viewport = page.getViewport({ scale: (pixels / width) * PAGE_UNITS_PER_POINT });
				const offscreen = window.document.createElement('canvas');
				offscreen.width = Math.round(viewport.width);
				offscreen.height = Math.round(viewport.height);
				task = page.render({ canvas: offscreen, viewport });
				try {
					await task.promise;
				} catch {
					return;
				}
				if (!alive) return;
				canvas.width = offscreen.width;
				canvas.height = offscreen.height;
				canvas.getContext('2d')!.drawImage(offscreen, 0, 0);
				shown = true;
			},
			shown ? SETTLE : 0
		);
		return () => {
			alive = false;
			clearTimeout(timer);
			task?.cancel();
		};
	});
</script>

<canvas bind:this={canvas} class="absolute inset-0 size-full" class:invisible={!shown} aria-hidden="true"></canvas>
