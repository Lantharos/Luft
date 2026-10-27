<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, ImageOverview, Offer, Variant } from '#lib/bindings.js';

	interface Props {
		overview: ImageOverview;
		activity: Activity;
		attempt: (action: () => Promise<unknown>) => void;
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

	const describe = (offer: Offer) => [t(REASONS[offer.to]), offer.size ? t('settings-updates-download-size', { size: bytes(offer.size) }) : null].filter(Boolean).join(' · ');
</script>

{#if overview.switching}
	<Row title={t(TITLES[overview.switching])} description={t(READY[overview.switching])}>
		<button type="button" class="button primary" disabled={busy} onclick={() => attempt(commands.updatesRestart)}>{t('settings-updates-restart')}</button>
	</Row>
{:else if overview.offer && !overview.returning}
	{@const offer = overview.offer}
	<Row title={t(TITLES[offer.to])} description={describe(offer)} truncate>
		{#if activity.running !== 'switch'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(() => commands.updatesSwitch({ variant: offer.to }))}>{t('settings-updates-switch')}</button>
		{/if}
	</Row>
{/if}
