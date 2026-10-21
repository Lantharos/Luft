<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import SpeedSlider from './SpeedSlider.svelte';

	type Mouse = {
		'left-handed': boolean;
		speed: number;
		'accel-profile': string;
		'natural-scroll': boolean;
	};

	const mouse = useSettings<Mouse>('org.gnome.desktop.peripherals.mouse', ['left-handed', 'speed', 'accel-profile', 'natural-scroll']);
</script>

<Section title={t('settings-mouse-mouse')}>
	<Row title={t('settings-mouse-primary-button')} description={t('settings-mouse-primary-button-description')}>
		<Segmented
			label={t('settings-mouse-primary-button')}
			options={[
				{ value: 'left', label: t('settings-mouse-primary-button-left') },
				{ value: 'right', label: t('settings-mouse-primary-button-right') }
			]}
			value={mouse.values['left-handed'] ? 'right' : 'left'}
			onchange={(button) => mouse.set('left-handed', button === 'right')}
		/>
	</Row>
	<Row title={t('settings-mouse-speed')}>
		{#snippet below()}
			<SpeedSlider label={t('settings-mouse-speed')} value={mouse.values.speed ?? 0} onchange={(speed) => mouse.set('speed', speed)} />
		{/snippet}
	</Row>
	<Row title={t('settings-mouse-acceleration')} description={t('settings-mouse-acceleration-description')}>
		<Switch
			label={t('settings-mouse-acceleration')}
			checked={mouse.values['accel-profile'] !== 'flat'}
			onchange={(on) => mouse.set('accel-profile', on ? 'default' : 'flat')}
		/>
	</Row>
	<Row title={t('settings-mouse-natural-scrolling')} description={t('settings-mouse-natural-scrolling-description')}>
		<Switch label={t('settings-mouse-natural-scrolling')} checked={mouse.values['natural-scroll'] ?? false} onchange={(on) => mouse.set('natural-scroll', on)} />
	</Row>
</Section>
