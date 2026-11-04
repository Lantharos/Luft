<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';

	const SIZE = 48;

	let { image, cell, columns, frames, rate }: { image: string; cell: number; columns: number; frames: number[]; rate: number } = $props();

	let step = $state(0);
	let frame = $derived(frames[step % frames.length]);
	let zoom = $derived(Math.max(1, Math.floor(SIZE / cell)));
	let size = $derived(cell * zoom);

	$effect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const timer = setInterval(() => step++, 1000 / rate);
		return () => clearInterval(timer);
	});
</script>

<div
	class="sprite"
	aria-hidden="true"
	style:width="{size}px"
	style:height="{size}px"
	style:background-image="url({fileUrl(image)})"
	style:background-size="{columns * size}px auto"
	style:background-position="-{(frame % columns) * size}px -{Math.floor(frame / columns) * size}px"
></div>

<style>
	.sprite {
		flex: none;
		background-repeat: no-repeat;
		image-rendering: pixelated;
	}
</style>
