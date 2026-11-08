<script lang="ts" module>
	const painted = new Map<string, { revision: number; bitmap: ImageBitmap }>();
</script>

<script lang="ts">
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { pageSize, paperOf, type PageEntry } from '#lib/library/model.js';
	import { paintThumbnail } from './thumbnail';

	let { notebook, entry, width }: { notebook: OpenNotebook; entry: PageEntry; width: number } = $props();

	let canvas: HTMLCanvasElement;
	let paper = $derived(paperOf(notebook.meta, entry));
	let size = $derived(pageSize(paper, entry));
	let height = $derived(Math.round((width * size.height) / size.width));
	let seen = $state(false);

	$effect(() => {
		const observer = new IntersectionObserver(([change]) => (seen = change.isIntersecting), { rootMargin: '400px 0px' });
		observer.observe(canvas);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!seen) return;
		const revision = notebook.revisions.get(entry.id) ?? 0;
		const pixels = Math.round(width * devicePixelRatio);
		const key = `${entry.id}:${pixels}:${paper.color}:${paper.template}`;
		const cached = painted.get(key);
		const context = canvas.getContext('2d')!;
		canvas.width = pixels;
		canvas.height = Math.round(height * devicePixelRatio);
		if (cached) context.drawImage(cached.bitmap, 0, 0);
		if (cached?.revision === revision) return;
		let alive = true;
		const timer = setTimeout(async () => {
			const store = await notebook.load(entry.id);
			if (!alive) return;
			paintThumbnail(canvas, paper, size, store.document);
			painted.set(key, { revision, bitmap: await createImageBitmap(canvas) });
		}, cached ? 250 : 0);
		return () => {
			alive = false;
			clearTimeout(timer);
		};
	});
</script>

<canvas bind:this={canvas} class="thumbnail block" style:width="{width}px" style:height="{height}px"></canvas>

<style>
	.thumbnail {
		border-radius: 4px;
		box-shadow: 0 0 0 1px var(--hairline);
	}
</style>
