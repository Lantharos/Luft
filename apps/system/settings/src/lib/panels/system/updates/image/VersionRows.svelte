<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, ImageOverview } from '#lib/bindings.js';
	import { named } from '../headline';
	import VariantRow from './VariantRow.svelte';

	interface Props {
		overview: ImageOverview;
		activity: Activity;
		attempt: (action: () => Promise<unknown>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	const busy = $derived(activity.running !== null);
</script>

<VariantRow {overview} {activity} {attempt} />
{#if overview.previous && !overview.returning}
	<Row title={t('settings-updates-go-back-title')} description={named(overview.previous, 'settings-updates-previous', 'settings-updates-previous-unversioned')}>
		<button type="button" class="button" disabled={busy} onclick={() => attempt(commands.updatesRollback)}>{t('settings-updates-go-back')}</button>
	</Row>
{/if}
