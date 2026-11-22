<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Snippet } from 'svelte';
	import Check from '@luft/symbols/icons/check';
	import Ellipsis from '@luft/symbols/icons/ellipsis';
	import { Dialog, MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import { app, type Selection } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';

	interface Export {
		label: string;
		run: () => Promise<boolean>;
	}

	interface Props {
		selection: Selection;
		onuse: () => Promise<unknown>;
		exports: Export[];
		onremove: () => Promise<void>;
		menu?: Snippet<[() => void]>;
	}

	let { selection, onuse, exports, onremove, menu }: Props = $props();

	let confirming = $state(false);
	let added = $derived(app.inSources(selection));

	async function run(task: () => Promise<unknown>, done?: string) {
		try {
			const result = await task();
			if (done && result !== false) toast.show(done);
		} catch (error) {
			toast.fail(error);
		}
	}

	async function use() {
		await run(onuse);
		await app.refreshSources();
	}
</script>

{#if added}
	<span class="added" role="img" aria-label={t('keys-in-sources')} {@attach tooltip(t('keys-in-sources'))}><Check size={17} /></span>
{:else}
	<button type="button" class="button" onclick={() => void use()}>{t('keys-add-to-sources')}</button>
{/if}

<MenuButton label={t('keys-more')} class="icon-button" align="end" minWidth={240}>
	{#snippet trigger()}
		<Ellipsis size={18} />
	{/snippet}
	{#snippet children(close)}
		{#if menu}
			{@render menu(close)}
			<MenuSeparator />
		{/if}
		{#each exports as item (item.label)}
			<MenuItem
				onclick={() => {
					close();
					void run(item.run, t('keys-saved'));
				}}>{item.label}</MenuItem
			>
		{/each}
		<MenuSeparator />
		<MenuItem
			danger
			onclick={() => {
				close();
				confirming = true;
			}}>{t('keys-delete', { kind: selection.kind })}</MenuItem
		>
	{/snippet}
</MenuButton>

{#if confirming}
	<Dialog title={t('keys-delete-title', { kind: selection.kind })} description={t('keys-delete-description')} onclose={() => (confirming = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>{t('keys-cancel')}</button>
			<button
				type="button"
				class="button danger"
				onclick={() => {
					confirming = false;
					void run(onremove);
				}}>{t('keys-delete-confirm')}</button
			>
		{/snippet}
	</Dialog>
{/if}

<style>
	.added {
		display: grid;
		height: 32px;
		width: 32px;
		place-items: center;
		color: var(--text-muted);
	}
</style>
