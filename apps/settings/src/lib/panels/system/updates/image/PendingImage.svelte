<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, bytes, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, ImageOverview, Release } from '#lib/bindings.js';
	import { named, versionName } from '../headline';
	import NotesDialog from './NotesDialog.svelte';

	interface Props {
		overview: ImageOverview;
		activity: Activity;
		attempt: (action: () => Promise<unknown>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	let notes = $state<Release | null>(null);

	const busy = $derived(activity.running !== null);
	const next = $derived(overview.switching ? null : (overview.available ?? overview.staged));
	const ready = $derived(next !== null && next === overview.staged);

	const summary = (release: Release) => release.notes?.[0].changes[0] ?? t('settings-updates-improvements');

	function describeNext(release: Release) {
		const released = release.released ? t('settings-updates-released', { when: ago(release.released) }) : null;
		const size = ready || !overview.available?.size ? null : t('settings-updates-download-size', { size: bytes(overview.available.size) });
		const replaces = !ready && overview.staged ? named(overview.staged, 'settings-updates-replaces', 'settings-updates-replaces-new') : null;
		return [versionName(release), released, size, replaces].filter(Boolean).join(' · ');
	}
</script>

{#if overview.returning}
	<Section>
		<Row title={versionName(overview.returning)} description={t('settings-updates-returning-description')}>
			<button type="button" class="button" disabled={busy} onclick={() => attempt(commands.updatesRollback)}>{named(overview.current, 'settings-updates-stay', 'settings-updates-stay-unversioned')}</button>
			<button type="button" class="button primary" disabled={busy} onclick={() => attempt(commands.updatesRestart)}>{t('settings-updates-restart')}</button>
		</Row>
	</Section>
{:else if next}
	<Section>
		<Row title={summary(next)} description={describeNext(next)} truncate>
			{#if ready}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(commands.updatesRestart)}>{t('settings-updates-restart-to-install')}</button>
			{:else if activity.running !== 'download'}
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(commands.updatesDownload)}>{t('settings-updates-download')}</button>
			{/if}
		</Row>
		{#if next.notes}
			<Row title={t('settings-updates-see-new')} onclick={() => (notes = next)} />
		{/if}
	</Section>
{/if}

{#if notes}
	<NotesDialog release={notes} onclose={() => (notes = null)} />
{/if}
