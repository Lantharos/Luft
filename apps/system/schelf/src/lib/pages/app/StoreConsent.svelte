<script lang="ts">
	import { bytes } from '@luft/ui';
	import type { StoreDetails } from '#lib/bindings.js';
	import { FULL_ACCESS_ABILITIES } from '#lib/app/fullAccess.js';
	import { abilities } from '#lib/app/extensionAccess.js';
	import { describe } from '#lib/app/permissions.js';
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';

	interface Props {
		store: StoreDetails;
		updating?: boolean;
		onconfirm: (fullAccess: boolean) => void;
		onclose: () => void;
	}

	let { store, updating = false, onconfirm, onclose }: Props = $props();

	const access = $derived(
		store.extension ? abilities(store.extension).map((ability) => ({ ...ability, description: '', notable: false })) : store.access ? describe(store.access) : null
	);
	const reason = $derived(store.declared?.unsandboxed);
	const verb = $derived(updating ? 'Update' : 'Install');
	const size = $derived(store.size ?? store.download?.size ?? null);
	const note = $derived(size ? `${bytes(size)} to download` : undefined);
</script>

{#if access}
	<ConsentDialog
		title="{verb} {store.name}?"
		description={updating
			? `This version of ${store.name} asks for more than before. It can use:`
			: store.extension
				? store.inShell
					? `schelf.store approved ${store.name} to run inside Luft. It can:`
					: `${store.name} runs in a sandbox. It can only:`
				: `${store.name} runs in a sandbox. It can use:`}
		{access}
		{note}
		confirm={verb}
		onconfirm={() => onconfirm(false)}
		{onclose}
	/>
{:else}
	<ConsentDialog
		title="{verb} {store.name} with full access?"
		description="{reason
			? `${store.name} asks to run outside a sandbox: “${reason}” There it can do anything a program you start yourself can, without asking.`
			: `${store.name} doesn't run in a sandbox, so it can do anything a program you start yourself can, without asking.`}{store.installer === 'appimage' ? ' You can take full access away on its page later.' : ''}"
		facts={FULL_ACCESS_ABILITIES}
		{note}
		confirm="{verb} with full access"
		danger
		onconfirm={() => onconfirm(true)}
		{onclose}
	/>
{/if}
