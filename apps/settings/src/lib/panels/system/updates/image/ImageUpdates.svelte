<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, bytes, Row, Section } from '@luft/ui';
	import { download, restart, rollback, type Activity, type ImageOverview, type Release } from '../api';
	import { named, versionName } from '../headline';
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

	const released = (release: Release) => (release.released ? t('settings-updates-released', { when: ago(release.released) }) : null);

	const summary = (release: Release) => release.notes?.split('\n').find((line) => line.trim())?.trim() ?? t('settings-updates-improvements');

	function describeNext(release: Release) {
		const size = ready || !overview.available?.size ? null : t('settings-updates-download-size', { size: bytes(overview.available.size) });
		const replaces = !ready && overview.staged ? named(overview.staged, 'settings-updates-replaces', 'settings-updates-replaces-new') : null;
		return [versionName(release), released(release), size, replaces].filter(Boolean).join(' · ');
	}
</script>

{#if overview.returning}
	<Section>
		<Row title={versionName(overview.returning)} description={t('settings-updates-returning-description')}>
			<button type="button" class="button" disabled={busy} onclick={() => attempt(rollback)}>{named(overview.current, 'settings-updates-stay', 'settings-updates-stay-unversioned')}</button>
			<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>{t('settings-updates-restart')}</button>
		</Row>
	</Section>
{:else if next}
	<Section>
		<Row title={summary(next)} description={describeNext(next)} truncate>
			{#if ready}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>{t('settings-updates-restart-to-install')}</button>
			{:else if activity.running !== 'download'}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(download)}>{t('settings-updates-download')}</button>
			{/if}
		</Row>
		{#if next.notes}
			<Row title={t('settings-updates-see-new')} onclick={() => (notes = next)} />
		{/if}
	</Section>
{/if}

<Section title={t('settings-updates-this-computer')}>
	<Row title={t('settings-updates-installed-version')} description={[overview.current.version, released(overview.current)].filter(Boolean).join(' · ') || t('settings-updates-unknown')}>
		{#if overview.current.notes}
			<button type="button" class="button" onclick={() => (notes = overview.current)}>{t('settings-updates-whats-new')}</button>
		{/if}
	</Row>
	<VariantRow {overview} {activity} {attempt} />
	{#if overview.previous && !overview.returning}
		<Row title={t('settings-updates-go-back-title')} description={named(overview.previous, 'settings-updates-previous', 'settings-updates-previous-unversioned')}>
			<button type="button" class="button" disabled={busy} onclick={() => attempt(rollback)}>{t('settings-updates-go-back')}</button>
		</Row>
	{/if}
</Section>

{#if notes}
	<NotesDialog release={notes} onclose={() => (notes = null)} />
{/if}
