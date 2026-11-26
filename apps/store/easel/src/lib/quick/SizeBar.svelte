<script lang="ts">
	import { t } from '@luft/i18n';
	import type { QuickEdit } from './quick.svelte';

	let { quick }: { quick: QuickEdit } = $props();
	let doc = $derived(quick.doc);
	let width = $state(0);
	let height = $state(0);

	$effect(() => {
		width = doc.width;
		height = doc.height;
	});

	const SHARES = [0.75, 0.5, 0.25];
	const MAX = 16384;
	let valid = $derived(width >= 1 && height >= 1 && width <= MAX && height <= MAX && (width !== doc.width || height !== doc.height));

	function setWidth(value: number) {
		width = value;
		height = Math.max(1, Math.round((value * doc.height) / doc.width));
	}
</script>

{#each SHARES as share (share)}
	<button type="button" class="chip" onclick={() => setWidth(Math.max(1, Math.round(doc.width * share)))}>{Math.round(share * 100)}%</button>
{/each}
<input class="text-field w-24 tabular-nums" aria-label={t('easel-width')} inputmode="numeric" value={width} oninput={(event) => setWidth(Number(event.currentTarget.value) || 0)} />
<span class="text-(--text-muted)">×</span>
<span class="w-16 text-[13px] text-(--text-soft) tabular-nums">{height}</span>
<button type="button" class="button" disabled={!valid} onclick={() => quick.resize(width, height)}>{t('easel-resize-apply')}</button>
