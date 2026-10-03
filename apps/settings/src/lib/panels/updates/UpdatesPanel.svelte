<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Row, Section } from '@luft/ui';
	import { bytes } from '#lib/format.js';
	import { appCount, cancel, check, download, firmware, onActivity, openApps, overview, restart, type Firmware, type Overview } from './api';
	import AutomaticSection from './AutomaticSection.svelte';
	import DetailsDialog from './DetailsDialog.svelte';
	import FirmwareSection from './FirmwareSection.svelte';
	import { ago, recently } from './time';
	import { describe } from './summary';

	let info = $state<Overview | null>(null);
	let devices = $state<Firmware[]>([]);
	let apps = $state<number | null>(null);
	let checking = $state(false);
	let error = $state<string | null>(null);
	let details = $state(false);

	const updates = $derived(info?.updates ?? []);
	const activity = $derived(info?.activity);
	const downloading = $derived(activity?.running === 'download');
	const size = $derived(updates.reduce((sum, update) => sum + update.downloadSize, 0));
	const fraction = $derived(downloading ? (activity?.progress?.fraction ?? null) : null);

	const headline = $derived.by(() => {
		if (!info) return 'Looking for updates…';
		if (info.prepared) return 'Updates are ready to install';
		if (downloading) return 'Downloading updates…';
		if (updates.length) return `${updates.length} ${updates.length === 1 ? 'update is' : 'updates are'} available`;
		return 'Your system is up to date';
	});

	const subline = $derived.by(() => {
		if (!info) return '';
		if (info.prepared) return 'Restart to install them. Your computer is back in a few minutes.';
		const parts = [info.checked ? `Last checked ${ago(info.checked)}` : 'Not checked yet'];
		if (info.results?.success && recently(info.results.finished)) parts.push(`updates installed ${ago(info.results.finished)}`);
		return parts.join(' · ');
	});

	async function load(next: Promise<Overview>) {
		try {
			info = await next;
			error = null;
		} catch (reason) {
			error = String(reason);
		}
	}

	async function checkNow() {
		checking = true;
		await load(check());
		checking = false;
		void refreshExtras();
	}

	async function refreshExtras() {
		devices = await firmware().catch(() => []);
		apps = await appCount().catch(() => null);
	}

	const stop = onActivity((next) => {
		const finished = info?.activity.running && !next.running;
		if (info) info.activity = next;
		if (finished) {
			void load(overview());
			void refreshExtras();
		}
	});
	onDestroy(stop);

	void load(overview());
	void refreshExtras();
</script>

<div class="flex items-center gap-4 px-2 pb-1">
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<span class="truncate text-[26px] font-semibold">{headline}</span>
		<span class="truncate text-[14px] text-[var(--text-muted)]">{error ?? subline}</span>
	</div>
	<button type="button" class="button" disabled={checking || downloading} onclick={checkNow}>{checking ? 'Checking…' : 'Check now'}</button>
</div>

{#if info?.results && !info.results.success && recently(info.results.finished)}
	<Section>
		<Row title="The last updates couldn't be installed" description={info.results.error ?? 'Your system was left as it was'} truncate />
	</Section>
{/if}

{#if updates.length}
	<Section>
		<Row title={describe(updates)} description="{updates.length} {updates.length === 1 ? 'update' : 'updates'} · {bytes(size)}">
			{#if info?.prepared}
				<button type="button" class="button primary" onclick={restart}>Restart and install</button>
			{:else if downloading}
				<button type="button" class="button" onclick={cancel}>Stop</button>
			{:else}
				<button type="button" class="button primary" onclick={download}>Download</button>
			{/if}
			{#snippet below()}
				{#if downloading}
					<div class="flex items-center gap-3">
						<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--control)]">
							<div class="bar h-full rounded-full bg-[var(--accent)]" class:indeterminate={fraction === null} style:width={fraction === null ? undefined : `${fraction * 100}%`}></div>
						</div>
						<span class="w-10 text-right text-[12.5px] text-[var(--text-muted)] tabular-nums">{fraction === null ? '' : `${Math.round(fraction * 100)}%`}</span>
					</div>
				{:else if activity?.error}
					<p class="text-[12.5px] text-[var(--danger)]">{activity.error}</p>
				{/if}
			{/snippet}
		</Row>
		<Row title="See what's included" onclick={() => (details = true)} />
	</Section>
{/if}

{#if devices.length && activity}
	<FirmwareSection {devices} {activity} />
{/if}

<Section title="Apps">
	<Row
		title="App updates"
		description={apps === null ? 'Looking for updates to your apps…' : apps ? `${apps} ${apps === 1 ? 'app has an update' : 'apps have updates'} in Schelf` : 'Managed in Schelf'}
		onclick={openApps}
	/>
</Section>

{#if info}
	<AutomaticSection bind:preferences={info.preferences} />
{/if}

{#if details}
	<DetailsDialog {updates} onclose={() => (details = false)} />
{/if}

<style>
	.bar {
		transition: width 240ms var(--ease);
	}

	.bar.indeterminate {
		width: 30%;
		animation: slide 1.4s var(--ease) infinite;
	}

	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(340%);
		}
	}
</style>
