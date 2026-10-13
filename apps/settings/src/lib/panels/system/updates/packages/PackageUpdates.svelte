<script lang="ts">
	import { bytes, Row, Section } from '@luft/ui';
	import { download, restart, type Activity, type PackageOverview } from '../api';
	import { recently } from '../time';
	import DetailsDialog from './DetailsDialog.svelte';
	import { describe } from './summary';

	interface Props {
		overview: PackageOverview;
		activity: Activity;
		attempt: (action: () => Promise<void>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	let details = $state(false);

	const busy = $derived(activity.running !== null);
	const list = $derived(overview.updates);
	const size = $derived(list.reduce((sum, update) => sum + update.downloadSize, 0));
</script>

{#if overview.results && !overview.results.success && recently(overview.results.finished)}
	<Section>
		<Row title="The last updates couldn't be installed" description={overview.results.error ?? 'Your system was left as it was'} truncate />
	</Section>
{/if}

{#if list.length}
	<Section>
		<Row title={describe(list)} description="{list.length} {list.length === 1 ? 'update' : 'updates'} · {bytes(size)}">
			{#if overview.prepared}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>Restart and install</button>
			{:else if activity.running !== 'download'}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(download)}>Download</button>
			{/if}
		</Row>
		<Row title="See what's included" onclick={() => (details = true)} />
	</Section>
{/if}

{#if details}
	<DetailsDialog updates={list} onclose={() => (details = false)} />
{/if}
