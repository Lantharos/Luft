<script lang="ts">
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem } from '@luft/ui';
	import type { Viewport } from '#lib/viewport/viewport.svelte.js';

	interface Props {
		viewport: Viewport;
		width: number;
		height: number;
	}

	let { viewport, width, height }: Props = $props();
	let percent = $derived(Math.round(viewport.scale * viewport.ratio * 100));
</script>

<MenuButton label={t('easel-zoom')} class="chip tabular-nums" align="end">
	{#snippet trigger()}<span class="tabular-nums">{percent}%</span>{/snippet}
	{#snippet children(close)}
		<MenuItem onclick={() => (close(), viewport.zoomBy(1.25))}>{t('easel-zoom-in')}</MenuItem>
		<MenuItem onclick={() => (close(), viewport.zoomBy(0.8))}>{t('easel-zoom-out')}</MenuItem>
		<MenuItem onclick={() => (close(), viewport.fit(width, height, true))}>{t('easel-zoom-fit')}</MenuItem>
		<MenuItem onclick={() => (close(), viewport.actualSize(width, height))}>{t('easel-zoom-actual')}</MenuItem>
	{/snippet}
</MenuButton>
