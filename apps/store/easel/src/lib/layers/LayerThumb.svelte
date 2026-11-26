<script lang="ts">
	import { Presenter } from '#lib/gpu/presenter.js';
	import type { Layer } from '#lib/document/layers.svelte.js';

	interface Props {
		layer: Layer;
		width: number;
		height: number;
		mask?: boolean;
	}

	let { layer, width, height, mask = false }: Props = $props();

	const SIZE = 32;
	const CHECKER: [number[], number[]] = [
		[0.42, 0.42, 0.41, 1],
		[0.33, 0.33, 0.32, 1]
	];

	let canvas = $state<HTMLCanvasElement>();
	let presenter: Presenter | null = null;

	$effect(() => {
		if (!canvas) return;
		const ratio = window.devicePixelRatio;
		canvas.width = canvas.height = SIZE * ratio;
		presenter = new Presenter(canvas, () => {
			const scale = (SIZE * ratio) / Math.max(width, height);
			const x = (SIZE * ratio - width * scale) / 2;
			const y = (SIZE * ratio - height * scale) / 2;
			return { view: [scale, 0, 0, scale, x, y], width, height, levels: [mask && layer.mask ? layer.mask : layer.pixels], floating: null, selection: null, checker: CHECKER, mono: mask };
		});
		return () => presenter?.destroy();
	});

	$effect(() => {
		void layer.version;
		void width;
		void height;
		presenter?.invalidate();
	});
</script>

<canvas bind:this={canvas} class="size-8 flex-none rounded-[7px] bg-(--surface)"></canvas>
