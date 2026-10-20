<script lang="ts">
	import { untrack } from 'svelte';
	import { i18n, t } from '@luft/i18n';
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

	let older = $derived(room?.older ?? []);
	let named = $derived(new Intl.ListFormat(i18n.locale, { type: 'conjunction' }).format(older.map((iso) => iso.name)));
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
	<Dialog title={t('stick-ventoy-title')} description={t('stick-ventoy-description')} {onclose}>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>{t('meet-cancel')}</button>
			<button type="button" class="button" disabled={session.busy} onclick={() => (asking = 'erase')}>{t('stick-erase-it')}</button>
			<button type="button" class="button primary" disabled={session.busy} onclick={addToVentoy}>{t('stick-add')}</button>
		{/snippet}
	</Dialog>
{:else if asking === 'replace'}
	<Dialog
		title={t('stick-replace-title')}
		description={t('stick-replace-description', { names: named, count: older.length })}
		{onclose}
	>
		{#snippet actions()}
			{#if sameName || room?.fit !== 'beside'}
				<button type="button" class="button" onclick={onclose}>{t('meet-cancel')}</button>
			{:else}
				<button type="button" class="button" onclick={() => make({ kind: 'ventoy', replace: false })}>{t('stick-keep', { count: older.length })}</button>
			{/if}
			<button type="button" class="button primary" onclick={() => make({ kind: 'ventoy', replace: true })}>{t('stick-replace')}</button>
		{/snippet}
	</Dialog>
{:else if asking === 'full'}
	<Dialog
		title={t('stick-full-title')}
		description={t('stick-full-description', { needed: bytes(needed), free: bytes(room?.free ?? 0) })}
		{onclose}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>{t('meet-cancel')}</button>
			<button type="button" class="button" onclick={() => (asking = 'erase')}>{t('stick-erase-it')}</button>
		{/snippet}
	</Dialog>
{:else}
	<Dialog title={t('stick-erase-title', { name: stick.name })} description={t('stick-erase-description', { size: bytes(stick.size) })} {onclose}>
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>{t('meet-cancel')}</button>
			<button type="button" class="button danger" onclick={() => make({ kind: 'erase' })}>{t('stick-erase-confirm')}</button>
		{/snippet}
	</Dialog>
{/if}
