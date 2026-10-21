<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row, Section } from '@luft/ui';
	import { download, restart, type Activity, type PackageOverview } from '../api';
	import { recently } from '../time';
	import DetailsDialog from './DetailsDialog.svelte';
	import { contents } from './summary';

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
		<Row title={t('settings-updates-failed')} description={overview.results.error ?? t('settings-updates-failed-description')} truncate />
	</Section>
{/if}

{#if list.length}
	<Section>
		<Row title={t('settings-updates-includes', { parts: contents(list) })} description={t('settings-updates-count-size', { count: list.length, size: bytes(size) })}>
			{#if overview.prepared}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>{t('settings-updates-restart-and-install')}</button>
			{:else if activity.running !== 'download'}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(download)}>{t('settings-updates-download')}</button>
			{/if}
		</Row>
		<Row title={t('settings-updates-see-included')} onclick={() => (details = true)} />
	</Section>
{/if}

{#if details}
	<DetailsDialog updates={list} onclose={() => (details = false)} />
{/if}
