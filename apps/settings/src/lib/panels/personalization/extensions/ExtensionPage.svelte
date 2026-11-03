<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, Row, Section, Switch } from '@luft/ui';
	import type { Extension } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { extensions, shown } from './extensions.svelte';
	import SettingRow from './SettingRow.svelte';
	import { PERMISSIONS, summary, usage } from './status';

	let { extension, onclose }: { extension: Extension; onclose: () => void } = $props();

	let removing = $state(false);
	let cost = $derived(usage(extension));
	let visible = $derived(extension.settings.filter((setting) => shown(extension, setting)));
</script>

<SubPage title={extension.name} {onclose}>
	<Section>
		<Row title={t('settings-extensions-enabled')} description={summary(extension)}>
			{#if extension.state !== 'invalid'}
				<Switch label={t('settings-extensions-on', { name: extension.name })} checked={extension.enabled} onchange={(on) => extensions.setEnabled(extension, on)} />
			{/if}
		</Row>
		{#if extension.problem && extension.state !== 'running'}
			<Row title={t('settings-extensions-problem')} description={extension.problem} />
		{/if}
		{#if cost}
			<Row title={t('settings-extensions-usage-title')} description={cost} />
		{/if}
	</Section>

	{#if visible.length}
		<Section title={t('settings-extensions-settings')}>
			{#each visible as setting (setting.key)}
				<SettingRow {extension} {setting} />
			{/each}
		</Section>
	{/if}

	{#if extension.permissions.length}
		<Section title={t('settings-extensions-permissions')}>
			{#each extension.permissions as permission (permission)}
				<Row title={PERMISSIONS[permission] ? t(PERMISSIONS[permission]) : permission} />
			{/each}
		</Section>
	{/if}

	<Section>
		<Row title={t('settings-extensions-remove')} description={t('settings-extensions-installed', { version: extension.version })} onclick={() => (removing = true)} />
	</Section>
</SubPage>

{#if removing}
	<ConfirmDialog
		title={t('settings-extensions-remove-title', { name: extension.name })}
		description={t('settings-extensions-remove-description')}
		action={t('settings-extensions-remove')}
		danger
		run={async () => {
			await extensions.remove(extension);
			onclose();
		}}
		onclose={() => (removing = false)}
	/>
{/if}
