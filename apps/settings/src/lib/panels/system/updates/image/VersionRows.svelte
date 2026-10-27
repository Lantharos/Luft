<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, Row } from '@luft/ui';
	import { rollback, type Activity, type SystemOverview, type Release } from '../api';
	import { named } from '../headline';
	import NotesDialog from './NotesDialog.svelte';
	import VariantRow from './VariantRow.svelte';

	interface Props {
		overview: SystemOverview;
		activity: Activity;
		attempt: (action: () => Promise<void>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	let notes = $state<Release | null>(null);

	const busy = $derived(activity.running !== null);
	const current = $derived(overview.current);
	const released = $derived(current.released ? t('settings-updates-released', { when: ago(current.released) }) : null);
</script>

<Row title={t('settings-updates-installed-version')} description={[current.version, released].filter(Boolean).join(' · ') || t('settings-updates-unknown')}>
	{#if current.notes}
		<button type="button" class="button" onclick={() => (notes = current)}>{t('settings-updates-whats-new')}</button>
	{/if}
</Row>
<VariantRow {overview} {activity} {attempt} />
{#if overview.previous && !overview.returning}
	<Row title={t('settings-updates-go-back-title')} description={named(overview.previous, 'settings-updates-previous', 'settings-updates-previous-unversioned')}>
		<button type="button" class="button" disabled={busy} onclick={() => attempt(rollback)}>{t('settings-updates-go-back')}</button>
	</Row>
{/if}

{#if notes}
	<NotesDialog release={notes} onclose={() => (notes = null)} />
{/if}
