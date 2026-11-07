<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, Slider, Spinner, SplitBar } from '@luft/ui';
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
	let nearby = $derived(installed.freeBefore + installed.freeAfter);
	let fitsFree = $derived(!!range && growing && range.freeAlone && change === range.free);
	let least = $derived(range ? (growing ? range.leastGrow : range.leastShrink) : 0);
	let allowed = $derived(!!range && change > 0 && (fitsFree || change >= least));

	let beside = $derived(installed.besideWindows);
	let drive = $derived(installed.drive);
	let fromFree = $derived(growing ? Math.min(nearby, change) : 0);
	let unclaimed = $derived(growing ? Math.max(0, nearby - change) : nearby + change);
	let free = $derived(Math.max(0, current + nearby - luft.size));

	let confirmTitle = $derived(
		growing ? t('resize-grow-title', { size: bytes(change) }) : beside ? t('resize-shrink-title', { size: bytes(change) }) : t('resize-trim-title', { size: bytes(change) })
	);
	let confirmDescription = $derived.by(() => {
		if (beside && growing) {
			if (change > nearby) return t('resize-grow-description');
			return installed.freeBefore > 0 ? t('resize-grow-free-description') : t('resize-grow-in-place-description');
		}
		if (beside) return t('resize-shrink-description');
		if (growing) return installed.freeBefore > 0 ? t('resize-grow-drive-move-description', { drive }) : t('resize-grow-drive-description', { drive });
		return t('resize-trim-description', { drive });
	});

	let note = $derived.by(() => {
		if (change > 0 && !allowed) return t('resize-least', { size: bytes(range?.freeAlone && growing ? range.free : least) });
		if (growing && nearby > 0) return t('resize-free-first', { size: bytes(nearby) });
		return installed.allocated === null ? '' : t('resize-used', { size: bytes(installed.allocated) });
	});

	function choose(next: number) {
		if (!range || next <= current || next - current >= range.leastGrow) {
			luft.size = next;
			return;
		}
		const choices = [current, ...(range.freeAlone ? [current + range.free] : []), ...(current + range.leastGrow <= range.most ? [current + range.leastGrow] : [])];
		luft.size = choices.reduce((best, choice) => (Math.abs(choice - next) < Math.abs(best - next) ? choice : best));
	}

	function apply() {
		confirming = false;
		void luft.resize();
	}
</script>

<Frame
	title={t('resize-title')}
	description={beside ? t('resize-description') : t('resize-drive-description', { drive })}
	onback={() => session.go('luft', -1)}
>
	{#if range && !beside}
		<div class="flex flex-col gap-4">
			<Slider
				value={luft.size}
				min={range.smallest}
				max={range.most}
				step={GIB}
				label={t('resize-title')}
				format={bytes}
				onchange={choose}
			/>
			<div class="flex justify-between text-[13.5px]">
				<span><span class="font-semibold">Luft</span> <span class="text-[var(--text-soft)]">{bytes(luft.size)}</span></span>
				<span class="text-[var(--text-soft)]">{t('resize-drive-free', { size: bytes(free), drive })}</span>
			</div>
			<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">{note}</p>
		</div>
	{:else if range}
		<div class="flex flex-col gap-6">
			<SplitBar
				total={installed.windowsSize + nearby + current}
				used={installed.windowsUsed}
				free={fromFree}
				{unclaimed}
				value={luft.size}
				min={range.smallest}
				max={range.most}
				step={GIB}
				onchange={choose}
			/>
			<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">{note}</p>
		</div>
	{:else if range === null}
		<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">{t('resize-full')}</p>
	{:else if !session.failure}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			<Spinner size={18} />{t('resize-measuring')}
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
		title={confirmTitle}
		description={confirmDescription}
		onclose={() => (confirming = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>{t('meet-cancel')}</button>
			<button type="button" class="button primary" onclick={apply}>{t('resize-apply')}</button>
		{/snippet}
	</Dialog>
{/if}
