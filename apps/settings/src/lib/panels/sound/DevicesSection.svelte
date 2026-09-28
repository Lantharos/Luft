<script lang="ts">
	import { Row, Section, Select } from '@luft/ui';
	import { setProfile, type Card } from './api';

	let { cards }: { cards: Card[] } = $props();
</script>

<Section title="Devices">
	{#each cards as card (card.index)}
		<Row title={card.description}>
			<Select
				label="How {card.description} is used"
				options={card.profiles.map((profile) => ({ value: profile.name, label: profile.description }))}
				value={card.profile ?? ''}
				placeholder="Off"
				onchange={(profile) => setProfile(card.index, profile)}
			/>
		</Row>
	{/each}
</Section>
