<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row } from '@luft/ui';
	import { restart, switchVariant, type Activity, type SystemOverview, type Variant, type VariantOffer } from '../api';

	interface Props {
		overview: SystemOverview;
		activity: Activity;
		attempt: (action: () => Promise<void>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	const TITLES: Record<Variant, string> = {
		nvidia: 'settings-updates-variant-nvidia',
		standard: 'settings-updates-variant-standard'
	};

	const READY: Record<Variant, string> = {
		nvidia: 'settings-updates-nvidia-ready',
		standard: 'settings-updates-standard-ready'
	};

	const REASONS: Record<Variant, string> = {
		nvidia: 'settings-updates-variant-nvidia-reason',
		standard: 'settings-updates-variant-standard-reason'
	};

	const busy = $derived(activity.running !== null);

	const describe = (offer: VariantOffer) => [t(REASONS[offer.to]), offer.size ? t('settings-updates-download-size', { size: bytes(offer.size) }) : null].filter(Boolean).join(' · ');
</script>

{#if overview.switching}
	<Row title={t(TITLES[overview.switching])} description={t(READY[overview.switching])}>
		<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>{t('settings-updates-restart')}</button>
	</Row>
{:else if overview.offer && !overview.returning}
	{@const offer = overview.offer}
	<Row title={t(TITLES[offer.to])} description={describe(offer)} truncate>
		{#if activity.running !== 'switch'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(() => switchVariant(offer.to))}>{t('settings-updates-switch')}</button>
		{/if}
	</Row>
{/if}
