<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { bytes } from '@luft/ui';
	import type { Stick } from '#lib/api/stick.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import Confirm from '#lib/stick/Confirm.svelte';
	import { detail } from '#lib/stick/describe.js';
	import DriveRow from '#lib/stick/DriveRow.svelte';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	let confirming = $state<Stick | null>(null);
	let needed = $derived(maker.offer?.size ?? 0);
	let ready = $derived(!!maker.stick && !!maker.offer && maker.stick.size >= needed && !session.busy);

	$effect(() => maker.watch());
</script>

<Frame title="Make a USB stick" description="Luft starts from it on any computer, to try it or to install it." onback={() => maker.back()}>
	{#if !maker.sticks}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if maker.problem}
				<Problem failure={maker.problem} />
			{:else}
				<LoaderCircle size={18} class="animate-spin" />Looking for USB drives…
			{/if}
		</div>
	{:else if maker.sticks.length === 0}
		<p class="py-2 text-[14px] text-[var(--text-soft)]">Plug in a USB stick of 4 GB or more. It shows up here.</p>
	{:else}
		<div class="-mx-2 flex flex-col gap-1" role="radiogroup" aria-label="USB drives">
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
		<p class="mt-7 text-[13px] text-[var(--text-muted)]">{maker.offer.name}, {bytes(maker.offer.size)}</p>
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
			{session.source.kind === 'file' ? 'Using your Luft ISO' : 'Use an ISO I already have'}
		</button>
		<button type="button" class="button primary large px-6" disabled={!ready} onclick={() => (confirming = maker.stick)}>Make the stick</button>
	{/snippet}
</Frame>

{#if confirming}
	<Confirm stick={confirming} onclose={() => (confirming = null)} />
{/if}
