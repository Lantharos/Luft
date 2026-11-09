<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Spinner } from '@luft/ui';
	import Camera from '@lucide/svelte/icons/camera';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import ScanLine from '@lucide/svelte/icons/scan-line';
	import type { Feed } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let { oncamera }: { oncamera: () => void } = $props();

	const FEEDS: Record<Feed, string> = { glass: 'feed-glass', feeder: 'feed-feeder', bothSides: 'feed-both-sides' };
	let feeds = $derived((flatbed.scanner?.feeds ?? []).map((feed) => ({ value: feed, label: t(FEEDS[feed]) })));
</script>

<div class="bar" data-no-drag>
	{#if flatbed.scanning}
		<div class="flex items-center gap-3 pr-1 pl-4 text-[14px]">
			<Spinner size={16} />
			<span>{t('scan-scanning', { name: flatbed.scanner?.name ?? '' })}</span>
		</div>
		<button type="button" class="button" onclick={() => flatbed.cancel()}>{t('scan-cancel')}</button>
	{:else if flatbed.scanner}
		{#if feeds.length > 1}
			<Segmented label={t('feed-label')} options={feeds} value={flatbed.feed} onchange={(feed) => (flatbed.feed = feed)} />
		{/if}
		<button type="button" class="button primary large" onclick={() => void flatbed.scan()}>
			<ScanLine size={18} />
			{t('scan-start')}
		</button>
	{:else}
		<button type="button" class="button primary large" onclick={oncamera}>
			<Camera size={18} />
			{t('camera-start')}
		</button>
	{/if}
	{#if !flatbed.scanning}
		<button type="button" class="button large" onclick={() => void flatbed.choosePictures()}>
			<ImagePlus size={18} />
			{t('import-open')}
		</button>
	{/if}
</div>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 88%, transparent);
		padding: 6px;
		box-shadow: 0 10px 32px var(--shadow-soft);
		backdrop-filter: blur(18px);
	}

	.bar :global(.button) {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
</style>
