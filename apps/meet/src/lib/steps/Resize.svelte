<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { t } from '@luft/i18n';
	import { bytes, Dialog, SplitBar } from '@luft/ui';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { luft } from '#lib/state/luft.svelte.js';
	import { session } from '#lib/state/meet.svelte.js';

	const GIB = 1024 ** 3;

	let confirming = $state(false);
	let installed = $derived(luft.installed!);
	let range = $derived(luft.range);
	let current = $derived(installed.size);
	let growing = $derived(luft.size > current);
	let change = $derived(Math.abs(luft.size - current));
	let least = $derived(range ? (growing ? range.leastGrow : range.leastShrink) : 0);
	let allowed = $derived(!!range && change > 0 && change >= least);

	let note = $derived.by(() => {
		if (change > 0 && change < least) return t('resize-least', { size: bytes(least) });
		return installed.allocated === null ? '' : t('resize-used', { size: bytes(installed.allocated) });
	});

	function apply() {
		confirming = false;
		void luft.resize();
	}
</script>

<Frame title={t('resize-title')} description={t('resize-description')} onback={() => session.go('luft', -1)}>
	{#if range}
		<div class="flex flex-col gap-6">
			<SplitBar
				total={installed.windowsSize + installed.windowsFree + current}
				used={installed.windowsUsed}
				value={luft.size}
				min={range.smallest}
				max={range.most}
				step={GIB}
				onchange={(next) => (luft.size = next)}
			/>
			<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">{note}</p>
		</div>
	{:else if range === null}
		<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">{t('resize-full')}</p>
	{:else if !session.failure}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			<LoaderCircle size={18} class="animate-spin" />{t('resize-measuring')}
		</div>
	{/if}
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{/if}
	{#snippet actions()}
		{#if range}
			<button type="button" class="button primary large px-6" disabled={!allowed} onclick={() => (confirming = true)}>{t('resize-apply')}</button>
		{/if}
	{/snippet}
</Frame>

{#if confirming}
	<Dialog
		title={growing ? t('resize-grow-title', { size: bytes(change) }) : t('resize-shrink-title', { size: bytes(change) })}
		description={growing ? t('resize-grow-description') : t('resize-shrink-description')}
		onclose={() => (confirming = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>{t('meet-cancel')}</button>
			<button type="button" class="button primary" onclick={apply}>{t('resize-apply')}</button>
		{/snippet}
	</Dialog>
{/if}
