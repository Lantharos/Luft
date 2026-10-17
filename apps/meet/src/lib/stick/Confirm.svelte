<script lang="ts">
	import { untrack } from 'svelte';
	import { bytes, Dialog } from '@luft/ui';
	import type { Room, Stick, Way } from '#lib/api/stick.js';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	interface Props {
		stick: Stick;
		onclose: () => void;
	}

	let { stick, onclose }: Props = $props();

	type Asking = 'ventoy' | 'replace' | 'full' | 'erase';

	let asking = $state<Asking>(untrack(() => (stick.ventoy ? 'ventoy' : 'erase')));
	let room = $state<Room | null>(null);
	let needed = $derived(maker.offer?.size ?? 0);
	const LIST = new Intl.ListFormat('en', { type: 'conjunction' });

	let older = $derived(room?.older ?? []);
	let named = $derived(LIST.format(older.map((iso) => iso.name)));
	let sameName = $derived(older.some((iso) => iso.name === maker.offer?.name));

	function make(way: Way) {
		const chosen = stick;
		onclose();
		void maker.make(chosen, way);
	}

	async function addToVentoy() {
		const found = await maker.room(stick, needed);
		if (!found) return onclose();
		room = found;
		if (found.fit === 'no') asking = 'full';
		else if (found.older.length > 0) asking = 'replace';
		else make({ kind: 'ventoy', replace: false });
	}
</script>

{#if asking === 'ventoy'}
	<Dialog title="This stick uses Ventoy" description="Add Luft to it, or erase the whole stick and make it a Luft stick?" {onclose}>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button" disabled={session.busy} onclick={() => (asking = 'erase')}>Erase it</button>
			<button type="button" class="button primary" disabled={session.busy} onclick={addToVentoy}>Add Luft</button>
		{/snippet}
	</Dialog>
{:else if asking === 'replace'}
	<Dialog
		title="Replace the Luft on it?"
		description="{named} {older.length === 1 ? 'is' : 'are'} already on this stick. The new Luft can take {older.length === 1 ? 'its' : 'their'} place."
		{onclose}
	>
		{#snippet actions()}
			{#if sameName || room?.fit !== 'beside'}
				<button type="button" class="button" onclick={onclose}>Cancel</button>
			{:else}
				<button type="button" class="button" onclick={() => make({ kind: 'ventoy', replace: false })}>Keep {older.length === 1 ? 'both' : 'all'}</button>
			{/if}
			<button type="button" class="button primary" onclick={() => make({ kind: 'ventoy', replace: true })}>Replace</button>
		{/snippet}
	</Dialog>
{:else if asking === 'full'}
	<Dialog
		title="There isn’t room for Luft"
		description="Luft needs {bytes(needed)}, and {bytes(room?.free ?? 0)} is free on this stick. Make room on it, or erase it and make it a Luft stick."
		{onclose}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button" onclick={() => (asking = 'erase')}>Erase it</button>
		{/snippet}
	</Dialog>
{:else}
	<Dialog title="Erase {stick.name}?" description="Everything on this {bytes(stick.size)} stick is erased and replaced with Luft. This can’t be undone." {onclose}>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button danger" onclick={() => make({ kind: 'erase' })}>Erase and make the stick</button>
		{/snippet}
	</Dialog>
{/if}
