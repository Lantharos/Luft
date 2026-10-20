<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	type Bell = {
		'visual-bell': boolean;
		'visual-bell-type': string;
	};

	const bell = useSettings<Bell>('org.gnome.desktop.wm.preferences', ['visual-bell', 'visual-bell-type']);

	let flashing = $derived(bell.values['visual-bell'] ?? false);
</script>

<Section title={t('settings-accessibility-hearing')}>
	<Row title={t('settings-accessibility-flash')}>
		<Switch label={t('settings-accessibility-flash')} checked={flashing} onchange={(on) => bell.set('visual-bell', on)} />
	</Row>
	{#if flashing}
		<Row title={t('settings-accessibility-flash-type')}>
			<Segmented
				label={t('settings-accessibility-flash-type')}
				options={[
					{ value: 'frame-flash', label: t('settings-accessibility-flash-window') },
					{ value: 'fullscreen-flash', label: t('settings-accessibility-flash-screen') }
				]}
				value={bell.values['visual-bell-type'] === 'fullscreen-flash' ? 'fullscreen-flash' : 'frame-flash'}
				onchange={(type) => bell.set('visual-bell-type', type)}
			/>
		</Row>
	{/if}
</Section>
