<script lang="ts">
	import { untrack } from 'svelte';
	import { fileUrl } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { commands, type PageView, type Quad } from '#lib/bindings.js';

	let { page, onclose }: { page: PageView; onclose: () => void } = $props();

	const WHOLE: Quad = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1]
	];

	let quad = $state<Quad>(untrack(() => structuredClone($state.snapshot(page.quad)) as Quad));
	let box = $state<HTMLDivElement>();
	let natural = $state({ width: 0, height: 0 });
	let area = $state({ width: 0, height: 0 });
	let dragging = $state<number | null>(null);

	let shown = $derived.by(() => {
		if (!natural.width || !area.width) return null;
		const scale = Math.min(area.width / natural.width, area.height / natural.height);
		const width = natural.width * scale;
		const height = natural.height * scale;
		return { left: (area.width - width) / 2, top: (area.height - height) / 2, width, height };
	});
	let points = $derived(shown ? quad.map(([x, y]) => [shown.left + x * shown.width, shown.top + y * shown.height]) : []);
	let changed = $derived(quad.some((corner, index) => corner[0] !== page.quad[index][0] || corner[1] !== page.quad[index][1]));

	$effect(() => {
		if (!box) return;
		const observer = new ResizeObserver(([entry]) => (area = { width: entry.contentRect.width, height: entry.contentRect.height }));
		observer.observe(box);
		return () => observer.disconnect();
	});

	function grab(event: PointerEvent, index: number) {
		(event.currentTarget as Element).setPointerCapture(event.pointerId);
		dragging = index;
	}

	function drag(event: PointerEvent) {
		if (dragging === null || !shown || !box) return;
		const bounds = box.getBoundingClientRect();
		const x = Math.min(1, Math.max(0, (event.clientX - bounds.left - shown.left) / shown.width));
		const y = Math.min(1, Math.max(0, (event.clientY - bounds.top - shown.top) / shown.height));
		quad[dragging] = [x, y];
	}

	function nudge(event: KeyboardEvent, index: number) {
		const step = event.shiftKey ? 0.02 : 0.004;
		const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
		const move = moves[event.key];
		if (!move) return;
		event.preventDefault();
		const [x, y] = quad[index];
		quad[index] = [Math.min(1, Math.max(0, x + move[0])), Math.min(1, Math.max(0, y + move[1]))];
	}

	async function done() {
		if (changed) await commands.pageCorners({ id: page.id, quad: $state.snapshot(quad) as Quad });
		onclose();
	}

	const CORNERS = ['corner-top-left', 'corner-top-right', 'corner-bottom-right', 'corner-bottom-left'];
</script>

<Dialog title={t('corners-title')} description={t('corners-description')} wide {onclose}>
	<div bind:this={box} class="stage" onpointermove={drag} onpointerup={() => (dragging = null)} role="presentation">
		<img
			src={fileUrl(page.source)}
			alt=""
			draggable="false"
			style:left="{shown?.left ?? 0}px"
			style:top="{shown?.top ?? 0}px"
			style:width="{shown?.width ?? 0}px"
			style:height="{shown?.height ?? 0}px"
			onload={(event) => {
				const image = event.currentTarget as HTMLImageElement;
				natural = { width: image.naturalWidth, height: image.naturalHeight };
			}}
		/>
		{#if shown}
			<svg class="outline" width={area.width} height={area.height} aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M0 0H{area.width}V{area.height}H0Z M{points.map(([x, y]) => `${x} ${y}`).join(' L')}Z"
				/>
				<polygon points={points.map(([x, y]) => `${x},${y}`).join(' ')} />
			</svg>
			{#each points as [x, y], index (index)}
				<button
					type="button"
					class="handle"
					class:active={dragging === index}
					style:left="{x}px"
					style:top="{y}px"
					aria-label={t(CORNERS[index])}
					onpointerdown={(event) => grab(event, index)}
					onkeydown={(event) => nudge(event, index)}
				></button>
			{/each}
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button mr-auto" onclick={() => (quad = structuredClone(WHOLE))}>{t('corners-whole')}</button>
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" onclick={() => void done()}>{t('dialog-done')}</button>
	{/snippet}
</Dialog>

<style>
	.stage {
		position: relative;
		height: min(62vh, 560px);
		overflow: hidden;
		border-radius: 14px;
		background: var(--control);
		touch-action: none;
		user-select: none;
	}

	img {
		position: absolute;
		pointer-events: none;
	}

	.outline {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.outline path {
		fill: rgb(0 0 0 / 0.42);
	}

	.outline polygon {
		fill: none;
		stroke: var(--accent);
		stroke-width: 2;
	}

	.handle {
		position: absolute;
		height: 22px;
		width: 22px;
		translate: -50% -50%;
		border: 3px solid var(--accent);
		border-radius: 50%;
		background: var(--content);
		cursor: grab;
		transition: scale var(--motion-tap) var(--ease-decelerate);
	}

	.handle.active {
		cursor: grabbing;
		scale: 1.25;
	}

	.handle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
</style>
