<script lang="ts">
	import { bytes, Row } from '@luft/ui';
	import { restart, switchVariant, type Activity, type ImageOverview, type Variant, type VariantOffer } from '../api';

	interface Props {
		overview: ImageOverview;
		activity: Activity;
		attempt: (action: () => Promise<void>) => void;
	}

	let { overview, activity, attempt }: Props = $props();

	const TITLES: Record<Variant, string> = {
		nvidia: "Use NVIDIA's driver",
		standard: 'Switch to the standard image'
	};

	const REASONS: Record<Variant, string> = {
		nvidia: 'Full speed from your NVIDIA graphics',
		standard: 'Smaller, as this computer has no NVIDIA graphics'
	};

	const busy = $derived(activity.running !== null);

	const describe = (offer: VariantOffer) => [REASONS[offer.to], offer.size ? `${bytes(offer.size)} to download` : null].filter(Boolean).join(' · ');
</script>

{#if overview.switching}
	<Row title={TITLES[overview.switching]} description="Restart to finish">
		<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>Restart</button>
	</Row>
{:else if overview.offer && !overview.returning}
	{@const offer = overview.offer}
	<Row title={TITLES[offer.to]} description={describe(offer)} truncate>
		{#if activity.running !== 'switch'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(() => switchVariant(offer.to))}>Switch</button>
		{/if}
	</Row>
{/if}
