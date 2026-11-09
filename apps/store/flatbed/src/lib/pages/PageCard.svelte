<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import Crop from '@lucide/svelte/icons/crop';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Trash from '@lucide/svelte/icons/trash-2';
	import type { PageView } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	interface Props {
		page: PageView;
		number: number;
		lifted: boolean;
		onopen: () => void;
	}

	let { page, number, lifted, onopen }: Props = $props();
	let ratio = $derived(page.width && page.height ? `${page.width} / ${page.height}` : '1 / 1.414');
</script>

<figure class="card" class:lifted data-page={page.id}>
	<button type="button" class="paper" style:aspect-ratio={ratio} aria-label={t('page-adjust', { number })} onclick={onopen}>
		{#if page.thumbnail}
			<img src={`${fileUrl(page.thumbnail)}?v=${page.version}`} alt="" draggable="false" />
		{/if}
	</button>
	<div class="actions">
		<button type="button" class="icon-button" aria-label={t('page-turn-left')} {@attach tooltip(t('page-turn-left'))} onclick={() => flatbed.turn(page, -1)}>
			<RotateCcw size={16} />
		</button>
		<button type="button" class="icon-button" aria-label={t('page-turn-right')} {@attach tooltip(t('page-turn-right'))} onclick={() => flatbed.turn(page, 1)}>
			<RotateCw size={16} />
		</button>
		<button type="button" class="icon-button" aria-label={t('page-corners')} {@attach tooltip(t('page-corners'))} onclick={onopen}>
			<Crop size={16} />
		</button>
		<button type="button" class="icon-button" aria-label={t('page-remove')} {@attach tooltip(t('page-remove'))} onclick={() => flatbed.remove(page)}>
			<Trash size={16} />
		</button>
	</div>
	<figcaption>{number}</figcaption>
</figure>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		touch-action: none;
	}

	.paper {
		display: block;
		width: 100%;
		overflow: hidden;
		border-radius: 6px;
		background: #fff;
		box-shadow:
			0 1px 2px var(--shadow-faint),
			0 6px 18px var(--shadow-faint);
		transition:
			transform var(--spring-snappy-duration) var(--spring-snappy),
			box-shadow var(--spring-snappy-duration) var(--spring-snappy);
	}

	.paper img {
		display: block;
		height: 100%;
		width: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.lifted .paper {
		transform: scale(1.04);
		box-shadow: 0 16px 40px var(--shadow-soft);
	}

	.lifted {
		z-index: 2;
	}

	.actions {
		position: absolute;
		top: 8px;
		display: flex;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 92%, transparent);
		padding: 3px;
		box-shadow: 0 6px 20px var(--shadow-soft);
		opacity: 0;
		transition: opacity var(--motion-quick) var(--ease-decelerate);
	}

	.card:hover .actions,
	.card:focus-within .actions {
		opacity: 1;
	}

	.lifted .actions {
		opacity: 0;
	}

	figcaption {
		font-size: 12px;
		color: var(--text-muted);
	}
</style>
