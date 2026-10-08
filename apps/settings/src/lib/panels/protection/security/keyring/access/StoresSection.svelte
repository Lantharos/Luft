<script lang="ts">
	import { AppIcon, ItemRow, Section } from '@luft/ui';
	import { forgetApp, type AppStore } from '../api';
	import ConfirmDialog from '../ConfirmDialog.svelte';

	let { stores, refresh }: { stores: AppStore[]; refresh: () => Promise<void> } = $props();

	let forgetting = $state<AppStore | null>(null);

	const saved = (count: number) => (count === 1 ? '1 saved sign-in' : `${count} saved sign-ins`);

	async function forget(store: AppStore) {
		await forgetApp(store.key);
		await refresh();
	}
</script>

<Section title="App sign-ins" description="Sign-ins some apps keep here, where only that app can read them.">
	{#each stores as store (store.key)}
		<ItemRow title={store.name} description={saved(store.secrets)}>
			{#snippet leading()}
				<AppIcon icon={store.icon} id={store.id ?? undefined} />
			{/snippet}
			<button type="button" class="button" onclick={() => (forgetting = store)}>Forget</button>
		</ItemRow>
	{/each}
</Section>

{#if forgetting}
	{@const store = forgetting}
	<ConfirmDialog
		title="Forget what {store.name} saved?"
		description="{store.name} loses the sign-ins it kept here, so you may need to sign in to it again."
		action="Forget"
		run={() => forget(store)}
		onclose={() => (forgetting = null)}
	/>
{/if}
