<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { Dialog, MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import { app, type Selection } from '$lib/state/app.svelte';
	import { toast } from '$lib/state/toast.svelte';

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
	}

	let { selection, what, onuse, exports, onremove }: Props = $props();

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
	<span class="flex items-center gap-1.5 px-2 text-[13px] text-[var(--text-muted)]"><Check size={15} />In your input sources</span>
{:else}
	<button type="button" class="button" onclick={() => void use()}>Add to input sources</button>
{/if}

<MenuButton label="More" class="icon-button" align="end" minWidth={240}>
	{#snippet trigger()}
		<Ellipsis size={18} />
	{/snippet}
	{#snippet children(close)}
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
	<Dialog title="Delete this {what}?" description="It's removed from your input sources too. This can't be undone." onclose={() => (confirming = false)}>
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
