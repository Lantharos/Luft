<script lang="ts">
	import { t } from '@luft/i18n';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let { number }: { number: number } = $props();
</script>

<div class="incoming" role="listitem" aria-label={t('scan-incoming')}>
	<div class="paper">
		{#if flatbed.preview}
			<img src={flatbed.preview} alt="" />
		{/if}
	</div>
	<span>{number}</span>
</div>

<style>
	.incoming {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.paper {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1.414;
		overflow: hidden;
		border-radius: 6px;
		background: color-mix(in oklab, var(--ink) 8%, transparent);
	}

	.paper::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		top: 0;
		height: 2px;
		background: var(--accent);
		opacity: 0.7;
		animation: pass 2.4s ease-in-out infinite alternate;
	}

	img {
		display: block;
		height: 100%;
		width: 100%;
		object-fit: cover;
		object-position: top;
	}

	span {
		font-size: 12px;
		color: var(--text-muted);
	}

	@keyframes pass {
		to {
			top: calc(100% - 2px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.paper::after {
			animation: none;
		}
	}
</style>
