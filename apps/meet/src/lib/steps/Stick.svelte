<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { Stick } from '#lib/api/stick.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import Confirm from '#lib/stick/Confirm.svelte';
	import { detail } from '#lib/stick/describe.js';
	import DriveRow from '#lib/components/DriveRow.svelte';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	const SMALLEST = 4 * 1000 ** 3;

	let confirming = $state<Stick | null>(null);
	let needed = $derived(maker.offer?.size ?? 0);
	let ready = $derived(!!maker.stick && !!maker.offer && maker.stick.size >= needed && !session.busy);

	$effect(() => maker.watch());
</script>

<Frame title={t('stick-title')} description={t('stick-description')} onback={() => maker.back()}>
	{#if !maker.sticks}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if maker.problem}
				<Problem failure={maker.problem} />
			{:else}
				<LoaderCircle size={18} class="animate-spin" />{t('stick-looking')}
			{/if}
		</div>
	{:else if maker.sticks.length === 0}
		<p class="py-2 text-[14px] text-[var(--text-soft)]">{t('stick-none', { size: bytes(SMALLEST) })}</p>
	{:else}
		<div class="-mx-2 flex flex-col gap-1" role="radiogroup" aria-label={t('stick-drives-label')}>
			{#each maker.sticks as stick (stick.id)}
				<DriveRow
					title={stick.name}
					detail={detail(stick, needed)}
					selected={maker.chosen === stick.id}
					disabled={needed > 0 && stick.size < needed}
					onclick={() => (maker.chosen = stick.id)}
				/>
			{/each}
		</div>
	{/if}
	{#if maker.offer}
		<p class="mt-7 text-[13px] text-[var(--text-muted)]">{t('stick-offer', { name: maker.offer.name, size: bytes(maker.offer.size) })}</p>
	{/if}
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{:else if maker.problem && maker.sticks}
		<div class="mt-4"><Problem failure={maker.problem} /></div>
	{:else if maker.unavailable}
		<div class="mt-6"><Problem failure={maker.unavailable} /></div>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => maker.chooseIso()}>
			{session.source.kind === 'file' ? t('meet-iso-using') : t('meet-iso-use')}
		</button>
		<button type="button" class="button primary large px-6" disabled={!ready} onclick={() => (confirming = maker.stick)}>{t('stick-make')}</button>
	{/snippet}
</Frame>

{#if confirming}
	<Confirm stick={confirming} onclose={() => (confirming = null)} />
{/if}
