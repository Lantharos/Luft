<script lang="ts">
	import type { Snippet } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { Dialog, MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import { app, type Selection } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';

	interface Export {
		label: string;
		run: () => Promise<boolean>;
	}

	interface Props {
		selection: Selection;
		what: string;
		onuse: () => Promise<void>;
		exports: Export[];
		onremove: () => Promise<void>;
		menu?: Snippet<[() => void]>;
	}

	let { selection, what, onuse, exports, onremove, menu }: Props = $props();

	let confirming = $state(false);
	let added = $derived(app.inSources(selection));

	async function run(task: () => Promise<unknown>, done?: string) {
		try {
			const result = await task();
			if (done && result !== false) toast.show(done);
		} catch (error) {
			toast.failed(error);
		}
	}

	async function use() {
		await run(onuse);
		await app.refreshSources();
	}
</script>

{#if added}
	<span class="added" role="img" aria-label="In your input sources" {@attach tooltip('In your input sources')}><Check size={17} /></span>
{:else}
	<button type="button" class="button" onclick={() => void use()}>Add to input sources</button>
{/if}

<MenuButton label="More" class="icon-button" align="end" minWidth={240}>
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
					void run(item.run, 'Saved');
				}}>{item.label}</MenuItem
			>
		{/each}
		<MenuSeparator />
		<MenuItem
			danger
			onclick={() => {
				close();
				confirming = true;
			}}>Delete {what}</MenuItem
		>
	{/snippet}
</MenuButton>

{#if confirming}
	<Dialog title="Delete this {what}?" description="It's removed from your input sources too." onclose={() => (confirming = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>Cancel</button>
			<button
				type="button"
				class="button danger"
				onclick={() => {
					confirming = false;
					void run(onremove);
				}}>Delete</button
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
