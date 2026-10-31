<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { AppIcon, IconButton, ItemRow, Row, Section, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Entry } from '#lib/bindings.js';
	import ChooseAppDialog from './ChooseAppDialog.svelte';

	let apps = $state<Entry[]>([]);
	let adding = $state(false);

	async function load() {
		apps = await commands.appsStartup();
	}

	async function toggle(app: Entry, enabled: boolean) {
		app.enabled = enabled;
		try {
			await commands.appsStartupSet({ id: app.id, enabled });
		} finally {
			await load();
		}
	}

	async function remove(app: Entry) {
		await commands.appsStartupRemove({ id: app.id });
		await load();
	}

	async function add(id: string) {
		adding = false;
		await commands.appsStartupAdd({ app: id });
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
			{#if app.removable}
				<IconButton icon={X} label={t('settings-apps-startup-remove', { app: app.name })} onclick={() => remove(app)} />
			{/if}
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
