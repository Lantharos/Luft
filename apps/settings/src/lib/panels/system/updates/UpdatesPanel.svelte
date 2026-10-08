<script lang="ts">
	import { ago, bytes, Row, Section } from '@luft/ui';
	import { updates } from '#lib/state/updates.svelte.js';
	import { describe as describeActivity, fractionOf, showsProgress } from './activity';
	import { cancel, check, download, firmware, load, openApps, preferences as loadPreferences, restart, type Activity, type Firmware, type Preferences } from './api';
	import AutomaticSection from './AutomaticSection.svelte';
	import DetailsDialog from './DetailsDialog.svelte';
	import FirmwareSection from './FirmwareSection.svelte';
	import ProgressTrack from './ProgressTrack.svelte';
	import { recently } from './time';
	import { describe } from './summary';

	let devices = $state<Firmware[]>([]);
	let preferences = $state<Preferences | null>(null);
	let failure = $state<string | null>(null);
	let details = $state(false);

	const info = $derived(updates.overview);
	const activity = $derived(updates.activity);
	const busy = $derived(activity.running !== null);
	const downloading = $derived(activity.running === 'download');
	const list = $derived(info?.updates ?? []);
	const size = $derived(list.reduce((sum, update) => sum + update.downloadSize, 0));
	const fraction = $derived(fractionOf(activity));
	const apps = $derived(info?.apps ?? null);

	const headline = $derived.by(() => {
		const running = describeActivity(activity);
		if (running) return running;
		if (!info) return 'Looking for updates…';
		if (info.prepared) return 'Updates are ready to install';
		if (list.length) return `${list.length} ${list.length === 1 ? 'update is' : 'updates are'} available`;
		return 'Your system is up to date';
	});

	const subline = $derived.by(() => {
		const error = failure ?? activity.error;
		if (error) return error;
		if (activity.running === 'elsewhere') return "You can look for updates again when it's done";
		if (!info) return '';
		if (info.prepared) return 'Restart to install them. Your computer is back in a few minutes.';
		const parts = [info.checked ? `Last checked ${ago(info.checked)}` : 'Not checked yet'];
		if (info.results?.success && recently(info.results.finished)) parts.push(`updates installed ${ago(info.results.finished)}`);
		return parts.join(' · ');
	});

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
</script>

<div class="flex flex-col gap-3 px-2 pb-1">
	<div class="flex items-center gap-4">
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="truncate text-[26px] font-semibold">{headline}</span>
			<span class="truncate text-[14px] text-[var(--text-muted)]">{subline}</span>
		</div>
		{#if downloading}
			<button type="button" class="button" onclick={() => attempt(cancel)}>Stop</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(check)}>{activity.running === 'check' ? 'Checking…' : 'Check now'}</button>
		{/if}
	</div>
	{#if showsProgress(activity)}
		<div class="flex items-center gap-3">
			<ProgressTrack {fraction} class="h-1.5 flex-1 bg-[var(--control)]" />
			<span class="w-10 text-right text-[12.5px] text-[var(--text-muted)] tabular-nums">{fraction === null ? '' : `${Math.round(fraction * 100)}%`}</span>
		</div>
	{/if}
</div>

{#if info?.results && !info.results.success && recently(info.results.finished)}
	<Section>
		<Row title="The last updates couldn't be installed" description={info.results.error ?? 'Your system was left as it was'} truncate />
	</Section>
{/if}

{#if list.length}
	<Section>
		<Row title={describe(list)} description="{list.length} {list.length === 1 ? 'update' : 'updates'} · {bytes(size)}">
			{#if info?.prepared}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>Restart and install</button>
			{:else if !downloading}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(download)}>Download</button>
			{/if}
		</Row>
		<Row title="See what's included" onclick={() => (details = true)} />
	</Section>
{/if}

{#if devices.length}
	<FirmwareSection {devices} {activity} />
{/if}

<Section title="Apps">
	<Row
		title="App updates"
		description={apps === null ? 'Looking for updates to your apps…' : apps ? `${apps} ${apps === 1 ? 'app has an update' : 'apps have updates'} in Schelf` : 'Managed in Schelf'}
		onclick={openApps}
	/>
</Section>

{#if preferences}
	<AutomaticSection bind:preferences />
{/if}

{#if details}
	<DetailsDialog updates={list} onclose={() => (details = false)} />
{/if}
