<script lang="ts">
	import { VirtualScroller, type VirtualHandle } from '@luft/ui';
	import { documentState } from './state.svelte';
	import { PageThumbnails } from './thumbnails';

	const WIDTH = 112;
	const LABEL = 24;

	let scroller = $state<VirtualHandle>();
	let aspect = $state(1.414);
	let thumbnails = $state.raw<PageThumbnails | null>(null);
	let numbers = $derived(Array.from({ length: documentState.pages }, (_, index) => index + 1));
	let layout = $derived({ itemHeight: Math.round(WIDTH * aspect) + LABEL, minItemWidth: WIDTH, gap: 10, padding: { top: 4, right: 16, bottom: 20, left: 16 } });

	$effect(() => {
		const pdf = documentState.document;
		if (!pdf) return;
		const created = new PageThumbnails(pdf, WIDTH * devicePixelRatio);
		thumbnails = created;
		void created.aspect().then((ratio) => (aspect = ratio));
		return () => {
			created.destroy();
			thumbnails = null;
		};
	});

	$effect(() => {
		scroller?.scrollToIndex(documentState.page - 1, 'nearest');
	});

	function draw(pageNumber: number) {
		return (canvas: HTMLCanvasElement) => {
			let mounted = true;
			void thumbnails?.render(pageNumber, () => mounted).then((bitmap) => {
				if (!bitmap || !mounted) return;
				canvas.width = bitmap.width;
				canvas.height = bitmap.height;
				canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
				canvas.classList.add('ready');
			});
			return () => (mounted = false);
		};
	}
</script>

<VirtualScroller bind:this={scroller} class="hidden-scroll min-h-0 flex-1" items={numbers} key={(pageNumber) => `${pageNumber}`} {layout}>
	{#snippet children(pageNumber)}
		<button
			type="button"
			class="thumbnail"
			class:current={pageNumber === documentState.page}
			aria-label="Page {pageNumber}"
			onclick={() => documentState.goTo(pageNumber)}
		>
			<span class="paper" style:aspect-ratio="1 / {aspect}">
				{#key thumbnails}
					<canvas {@attach draw(pageNumber)}></canvas>
				{/key}
			</span>
			<span class="number">{pageNumber}</span>
		</button>
	{/snippet}
</VirtualScroller>

<style>
	.thumbnail {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.paper {
		display: block;
		width: 100%;
		overflow: hidden;
		border-radius: 4px;
		background: #fff;
		box-shadow: 0 1px 6px rgba(0, 0, 0, 0.22);
		transition: box-shadow 160ms var(--ease);
	}

	.current .paper {
		box-shadow: 0 0 0 2px var(--accent);
	}

	canvas {
		display: block;
		height: 100%;
		width: 100%;
		opacity: 0;
		transition: opacity 160ms var(--ease);
	}

	canvas:global(.ready) {
		opacity: 1;
	}

	.number {
		font-size: 11px;
		color: var(--sidebar-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.current .number {
		color: var(--text);
		font-weight: 600;
	}
</style>
