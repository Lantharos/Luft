<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import X from '@lucide/svelte/icons/x';
	import type { Screenshot } from '#lib/bridge/types.js';

	let { screenshots }: { screenshots: Screenshot[] } = $props();
	let open = $state<number | null>(null);
	let failed = $state<Set<string>>(new Set());

	const shown = $derived(screenshots.filter((shot) => !failed.has(shot.url)));

	function step(offset: number) {
		if (open === null) return;
		open = (open + offset + shown.length) % shown.length;
	}

	function keys(event: KeyboardEvent) {
		if (open === null) return;
		if (event.key === 'Escape') open = null;
		else if (event.key === 'ArrowRight') step(1);
		else if (event.key === 'ArrowLeft') step(-1);
	}

	function fail(url: string) {
		failed = new Set([...failed, url]);
	}
</script>

<svelte:window onkeydown={keys} />

{#if shown.length}
	<div class="strip soft-scroll">
		{#each shown as shot, index (shot.url)}
			<button type="button" class="shot" aria-label={shot.caption ?? `Screenshot ${index + 1}`} onclick={() => (open = index)}>
				<img src={shot.url} alt={shot.caption ?? ''} loading="lazy" decoding="async" onerror={() => fail(shot.url)} />
			</button>
		{/each}
	</div>
{/if}

{#if open !== null && shown[open]}
	{@const shot = shown[open]}
	<div class="lightbox" role="dialog" aria-modal="true" aria-label={shot.caption ?? 'Screenshot'}>
		<button type="button" class="backdrop" aria-label="Close" onclick={() => (open = null)}></button>
		<figure>
			<img src={shot.url} alt={shot.caption ?? ''} />
			{#if shot.caption}
				<figcaption>{shot.caption}</figcaption>
			{/if}
		</figure>
		<button type="button" class="icon-button large close" aria-label="Close" onclick={() => (open = null)}><X size={18} /></button>
		{#if shown.length > 1}
			<button type="button" class="icon-button large previous" aria-label="Previous screenshot" onclick={() => step(-1)}><ChevronLeft size={20} /></button>
			<button type="button" class="icon-button large next" aria-label="Next screenshot" onclick={() => step(1)}><ChevronRight size={20} /></button>
		{/if}
	</div>
{/if}

<style>
	.strip {
		display: flex;
		gap: 12px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding-bottom: 6px;
	}

	.shot {
		flex: none;
		height: 260px;
		overflow: hidden;
		border-radius: 14px;
		background: var(--surface);
		scroll-snap-align: start;
		transition: transform 180ms var(--ease);
	}

	.shot:active {
		transform: scale(0.985);
	}

	.shot img {
		height: 100%;
		width: auto;
		max-width: 520px;
		object-fit: cover;
	}

	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: center;
		padding: 56px 72px;
		animation: fade 180ms var(--ease);
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: color-mix(in oklab, var(--app-bg) 88%, transparent);
	}

	figure {
		position: relative;
		display: flex;
		max-height: 100%;
		max-width: 100%;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	figure img {
		max-height: calc(100vh - 160px);
		max-width: 100%;
		border-radius: 14px;
		object-fit: contain;
		box-shadow: 0 24px 64px var(--shadow-soft);
	}

	figcaption {
		font-size: 13px;
		color: var(--text-soft);
	}

	.close {
		position: absolute;
		top: 16px;
		right: 16px;
	}

	.previous,
	.next {
		position: absolute;
		top: 50%;
		translate: 0 -50%;
		background: var(--control);
	}

	.previous {
		left: 16px;
	}

	.next {
		right: 16px;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}
</style>
