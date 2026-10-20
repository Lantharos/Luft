<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@lucide/svelte/icons/plus';
	import { AppIcon, ItemRow, Row, Section, Switch } from '@luft/ui';
	import ChooseAppDialog from './ChooseAppDialog.svelte';
	import { addStartup, setStartup, startupApps, type StartupApp } from './api';

	let apps = $state<StartupApp[]>([]);
	let adding = $state(false);

	async function load() {
		apps = await startupApps();
	}

	async function toggle(app: StartupApp, enabled: boolean) {
		app.enabled = enabled;
		try {
			await setStartup(app.id, enabled);
		} finally {
			await load();
		}
	}

	async function add(id: string) {
		adding = false;
		await addStartup(id);
		await load();
	}

	void load();
</script>

<Section title={t('settings-apps-startup')} description={t('settings-apps-startup-description')}>
	{#each apps as app (app.id)}
		<ItemRow title={app.name}>
			{#snippet leading()}
				<AppIcon icon={app.icon} id={app.id} />
			{/snippet}
			<Switch label={t('settings-apps-startup-app', { app: app.name })} checked={app.enabled} onchange={(enabled) => toggle(app, enabled)} />
		</ItemRow>
	{/each}
	<Row title={t('settings-apps-startup-add')} icon={Plus} onclick={() => (adding = true)} />
</Section>

{#if adding}
	<ChooseAppDialog
		title={t('settings-apps-startup-add-title')}
		description={t('settings-apps-startup-add-description')}
		exclude={apps.filter((app) => app.enabled).map((app) => app.id)}
		onchoose={add}
		onclose={() => (adding = false)}
	/>
{/if}
