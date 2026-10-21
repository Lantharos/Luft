<script lang="ts">
	import { t } from '@luft/i18n';
	import Info from '@lucide/svelte/icons/info';
	import { ActionRow, Row, Section } from '@luft/ui';
	import { updates } from '#lib/state/updates.svelte.js';
	import { downloading, fractionOf, showsProgress } from './activity';
	import { cancel, check, firmware, load, openApps, preferences as loadPreferences, type Activity, type Firmware, type Preferences } from './api';
	import AutomaticSection from './AutomaticSection.svelte';
	import FirmwareSection from './FirmwareSection.svelte';
	import { headline, subline } from './headline';
	import PendingImage from './image/PendingImage.svelte';
	import VersionRows from './image/VersionRows.svelte';
	import PackageUpdates from './packages/PackageUpdates.svelte';
	import { about } from '../about/api';
	import ProgressTrack from '#lib/components/ProgressTrack.svelte';
	import { percent } from '#lib/format.js';

	let { onabout }: { onabout: () => void } = $props();

	let devices = $state<Firmware[]>([]);
	let deviceName = $state<string>();
	let preferences = $state<Preferences | null>(null);
	let failure = $state<string | null>(null);

	const info = $derived(updates.overview);
	const activity = $derived(updates.activity);
	const busy = $derived(activity.running !== null);
	const fraction = $derived(fractionOf(activity));
	const apps = $derived(info?.apps ?? null);

	async function attempt(action: () => Promise<void>) {
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

	void attempt(load);
	void loadDevices();
	void loadPreferences().then((loaded) => (preferences = loaded));
	void about().then((info) => (deviceName = info.deviceName));
</script>

<div class="flex flex-col gap-3 px-2 pb-1">
	<div class="flex items-center gap-4">
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="truncate text-[26px] font-semibold">{headline(info, activity)}</span>
			<span class="truncate text-[14px] text-[var(--text-muted)]">{subline(info, activity, failure)}</span>
		</div>
		{#if downloading(activity)}
			<button type="button" class="button" onclick={() => attempt(cancel)}>{t('settings-updates-stop')}</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(check)}>{activity.running === 'check' ? t('settings-updates-checking-button') : t('settings-updates-check')}</button>
		{/if}
	</div>
	{#if showsProgress(activity)}
		<div class="flex items-center gap-3">
			<ProgressTrack {fraction} class="h-1.5 flex-1 bg-[var(--control)]" />
			<span class="w-10 text-right text-[12.5px] text-[var(--text-muted)] tabular-nums">{fraction === null ? '' : percent(fraction)}</span>
		</div>
	{/if}
</div>

{#if info?.system.kind === 'packages'}
	<PackageUpdates overview={info.system} {activity} {attempt} />
{:else if info?.system.kind === 'image'}
	<PendingImage overview={info.system} {activity} {attempt} />
{/if}

<Section title={t('settings-updates-this-computer')}>
	{#if info?.system.kind === 'image'}
		<VersionRows overview={info.system} {activity} {attempt} />
	{/if}
	<ActionRow title={t('settings-page-about')} icon={Info} description={deviceName} onclick={onabout} />
</Section>

{#if devices.length}
	<FirmwareSection {devices} {activity} />
{/if}

<Section title={t('settings-updates-apps')}>
	<Row
		title={t('settings-updates-app-updates')}
		description={apps === null ? t('settings-updates-apps-checking') : t('settings-updates-apps-count', { count: apps })}
		onclick={openApps}
	/>
</Section>

{#if preferences}
	<AutomaticSection bind:preferences />
{/if}
