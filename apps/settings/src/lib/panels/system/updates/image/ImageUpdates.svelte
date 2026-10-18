<script lang="ts">
	import { ago, bytes, Row, Section } from '@luft/ui';
	import { download, restart, rollback, type Activity, type ImageOverview, type Release } from '../api';
	import { versionName } from '../headline';
	import NotesDialog from './NotesDialog.svelte';
	import VariantRow from './VariantRow.svelte';

	interface Props {
		overview: ImageOverview;
		activity: Activity;
		attempt: (action: () => Promise<void>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	let notes = $state<Release | null>(null);

	const busy = $derived(activity.running !== null);
	const next = $derived(overview.switching ? null : (overview.available ?? overview.staged));
	const ready = $derived(next !== null && next === overview.staged);

	const released = (release: Release) => (release.released ? `Released ${ago(release.released)}` : null);

	const summary = (release: Release) => release.notes?.split('\n').find((line) => line.trim())?.trim() ?? 'Fixes and improvements across the system';

	function describeNext(release: Release) {
		const size = ready || !overview.available?.size ? null : `${bytes(overview.available.size)} to download`;
		const replaces = !ready && overview.staged ? `Replaces ${versionName(overview.staged).toLowerCase()}, which is waiting to install` : null;
		return [versionName(release), released(release), size, replaces].filter(Boolean).join(' · ');
	}
</script>

{#if overview.returning}
	<Section>
		<Row title={versionName(overview.returning)} description="The version you had before. Your files and settings stay as they are.">
			<button type="button" class="button" disabled={busy} onclick={() => attempt(rollback)}>Stay on {overview.current.version ?? 'this version'}</button>
			<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>Restart</button>
		</Row>
	</Section>
{:else if next}
	<Section>
		<Row title={summary(next)} description={describeNext(next)} truncate>
			{#if ready}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>Restart to install</button>
			{:else if activity.running !== 'download'}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(download)}>Download</button>
			{/if}
		</Row>
		{#if next.notes}
			<Row title="See what's new" onclick={() => (notes = next)} />
		{/if}
	</Section>
{/if}

<Section title="This computer">
	<Row title="Installed version" description={[overview.current.version, released(overview.current)].filter(Boolean).join(' · ') || 'Unknown'}>
		{#if overview.current.notes}
			<button type="button" class="button" onclick={() => (notes = overview.current)}>What's new</button>
		{/if}
	</Row>
	<VariantRow {overview} {activity} {attempt} />
	{#if overview.previous && !overview.returning}
		<Row title="Go back to the previous version" description="{versionName(overview.previous)}. Your files and settings stay as they are.">
			<button type="button" class="button" disabled={busy} onclick={() => attempt(rollback)}>Go back</button>
		</Row>
	{/if}
</Section>

{#if notes}
	<NotesDialog release={notes} onclose={() => (notes = null)} />
{/if}
