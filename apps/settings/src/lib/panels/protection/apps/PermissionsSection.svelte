<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '@luft/i18n';
	import { Section } from '@luft/ui';
	import PermissionApp from './PermissionApp.svelte';
	import { Permissions } from './permissions.svelte';

	const permissions = new Permissions();

	onMount(() => permissions.start());
</script>

{#if permissions.apps.length}
	<Section title={t('settings-apps-permissions')} description={t('settings-apps-permissions-description')}>
		{#each permissions.apps as app (app.id)}
			<PermissionApp {app} {permissions} />
		{/each}
	</Section>

	{#if permissions.error}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{permissions.error}</p>
	{/if}
{/if}
