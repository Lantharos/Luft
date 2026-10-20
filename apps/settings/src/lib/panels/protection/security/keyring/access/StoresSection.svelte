<script lang="ts">
	import { t } from '@luft/i18n';
	import { AppIcon, ItemRow, Section } from '@luft/ui';
	import { forgetApp, type AppStore } from '../api';
	import ConfirmDialog from '../ConfirmDialog.svelte';

	let { stores, refresh }: { stores: AppStore[]; refresh: () => Promise<void> } = $props();

	let forgetting = $state<AppStore | null>(null);

	async function forget(store: AppStore) {
		await forgetApp(store.key);
		await refresh();
	}
</script>

<Section title={t('settings-passwords-stores')} description={t('settings-passwords-stores-description')}>
	{#each stores as store (store.key)}
		<ItemRow title={store.name} description={t('settings-passwords-stores-count', { count: store.secrets })}>
			{#snippet leading()}
				<AppIcon icon={store.icon} id={store.id ?? undefined} />
			{/snippet}
			<button type="button" class="button" onclick={() => (forgetting = store)}>{t('settings-passwords-forget')}</button>
		</ItemRow>
	{/each}
</Section>

{#if forgetting}
	{@const store = forgetting}
	<ConfirmDialog
		title={t('settings-passwords-forget-title', { app: store.name })}
		description={t('settings-passwords-forget-description', { app: store.name })}
		action={t('settings-passwords-forget')}
		run={() => forget(store)}
		onclose={() => (forgetting = null)}
	/>
{/if}
