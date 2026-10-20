<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select } from '@luft/ui';
	import { setProfile, type Card } from './api';

	let { cards }: { cards: Card[] } = $props();
</script>

<Section description={t('settings-sound-profiles-description')}>
	{#each cards as card (card.index)}
		<Row title={card.description}>
			<Select
				label={t('settings-sound-profile-label', { device: card.description })}
				options={card.profiles.map((profile) => ({ value: profile.name, label: profile.description }))}
				value={card.profile ?? ''}
				placeholder={t('settings-sound-profile-off')}
				onchange={(profile) => setProfile(card.index, profile)}
			/>
		</Row>
	{/each}
</Section>
