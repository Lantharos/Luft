<script lang="ts">
	import { bytes, Dialog } from '@luft/ui';
	import type { StoreDetails } from '#lib/bindings.js';
	import { FULL_ACCESS_ABILITIES } from '#lib/app/fullAccess.js';
	import { abilities } from '#lib/app/extensionAccess.js';
	import { describe } from '#lib/app/permissions.js';
	import TrustDialog from '#lib/components/TrustDialog.svelte';

	interface Props {
		store: StoreDetails;
		updating?: boolean;
		onconfirm: (fullAccess: boolean) => void;
		onclose: () => void;
	}

	let { store, updating = false, onconfirm, onclose }: Props = $props();

	const access = $derived(store.extension ? abilities(store.extension) : store.access ? describe(store.access) : null);
	const reason = $derived(store.declared?.unsandboxed);
	const verb = $derived(updating ? 'Update' : 'Install');
	const size = $derived(store.size ?? store.download?.size ?? null);
</script>

{#if access}
	<Dialog
		title="{verb} {store.name}?"
		description={updating
			? `This version of ${store.name} asks for more than before. It can use:`
			: store.extension
				? `${store.name} can:`
				: `${store.name} runs in a sandbox. It can use:`}
		{onclose}
	>
		<ul class="flex flex-col gap-3 text-[13.5px]">
			{#each access as entry (entry.title)}
				<li class="flex items-start gap-3">
					<span class="mt-0.5 text-[var(--text-soft)]"><entry.icon size={18} /></span>
					<span class="flex flex-col gap-0.5">
						<span class="font-medium">{entry.title}</span>
						{#if 'description' in entry}
							<span class="text-[var(--text-muted)]">{entry.description}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
		{#if size}
			<p class="mt-4 text-[13px] text-[var(--text-muted)]">{bytes(size)} to download</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
			<button type="button" class="button primary" onclick={() => onconfirm(false)}>{verb}</button>
		{/snippet}
	</Dialog>
{:else}
	<TrustDialog
		title="{verb} {store.name} with full access?"
		description="{reason
			? `${store.name} asks to run outside a sandbox: “${reason}” There it can do anything a program you start yourself can, without asking.`
			: `${store.name} doesn't run in a sandbox, so it can do anything a program you start yourself can, without asking.`}{store.installer === 'appimage' ? ' You can take full access away on its page later.' : ''}"
		facts={FULL_ACCESS_ABILITIES}
		confirm="{verb} with full access"
		note={size ? `${bytes(size)} to download` : undefined}
		onconfirm={() => onconfirm(true)}
		{onclose}
	/>
{/if}
