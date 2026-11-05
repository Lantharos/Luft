<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, Firmware, UpdatePolicy } from '#lib/bindings.js';
	import { updates } from '#lib/state/updates.svelte.js';
	import { firmware, openApps, openInstalledApps } from './api';
	import AutomaticRows from './AutomaticRows.svelte';
	import FirmwareSection from './FirmwareSection.svelte';
	import PendingImage from './image/PendingImage.svelte';
	import VersionRows from './image/VersionRows.svelte';
	import StatusCard from './StatusCard.svelte';

	let { onabout }: { onabout: () => void } = $props();

	let devices = $state<Firmware[]>([]);
	let deviceName = $state<string>();
	let systemName = $state<string | null>(null);
	let preferences = $state<UpdatePolicy | null>(null);
	let failure = $state<string | null>(null);

	const info = $derived(updates.overview);
	const activity = $derived(updates.activity);
	const apps = $derived(info?.apps ?? null);
	const system = $derived(info?.system ?? null);
	const versionRows = $derived(!!system && (!!system.switching || ((!!system.offer || !!system.previous) && !system.returning)));

	async function attempt(action: () => Promise<unknown>) {
		failure = null;
		await action().catch((reason) => (failure = String(reason)));
	}

	async function loadDevices() {
		devices = await firmware().catch(() => []);
	}

	let previous: Activity['running'] = null;
	$effect(() => {
		const running = activity.running;
		if (previous === 'firmware' && running !== 'firmware') void loadDevices();
		previous = running;
	});

	void attempt(commands.updatesLoad);
	void loadDevices();
	void commands.updatesPreferences().then((loaded) => (preferences = loaded));
	void commands.about().then((about) => {
		deviceName = about.deviceName;
		systemName = about.system;
	});
</script>

<StatusCard system={systemName} overview={info} {activity} {failure} {attempt} />

{#if info}
	<PendingImage overview={info.system} {activity} {attempt} />
{/if}

<Section>
	<Row title={t('settings-page-about')} description={deviceName} onclick={onabout} />
	<Row
		title={t('settings-updates-app-updates')}
		description={apps === null ? t('settings-updates-apps-checking') : t('settings-updates-apps-count', { count: apps })}
		onclick={openApps}
	/>
	{#each info?.sabine ?? [] as app (app.name)}
		<Row
			title={t('settings-updates-sabine-waiting', { app: app.name })}
			description={app.update ? t('settings-updates-sabine-update-ready', { app: app.name }) : t('settings-updates-sabine-update-or-remove', { app: app.name })}
			onclick={app.update ? openApps : openInstalledApps}
		/>
	{/each}
</Section>

{#if devices.length}
	<FirmwareSection {devices} {activity} />
{/if}

{#if preferences || versionRows}
	<Section title={t('settings-updates-automatic')}>
		{#if preferences}
			<AutomaticRows bind:preferences />
		{/if}
		{#if system && versionRows}
			<VersionRows overview={system} {activity} {attempt} />
		{/if}
	</Section>
{/if}
