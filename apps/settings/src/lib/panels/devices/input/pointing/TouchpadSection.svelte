<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import SpeedSlider from './SpeedSlider.svelte';

	type Touchpad = {
		'send-events': string;
		speed: number;
		'scroll-speed': number;
		'tap-to-click': boolean;
		'natural-scroll': boolean;
		'two-finger-scrolling-enabled': boolean;
		'edge-scrolling-enabled': boolean;
		'disable-while-typing': boolean;
		'click-method': string;
	};

	const touchpad = useSettings<Touchpad>('org.gnome.desktop.peripherals.touchpad', [
		'send-events',
		'speed',
		'scroll-speed',
		'tap-to-click',
		'natural-scroll',
		'two-finger-scrolling-enabled',
		'edge-scrolling-enabled',
		'disable-while-typing',
		'click-method'
	]);

	const SCROLL_SPEED_OCTAVES = 1.5;

	let off = $derived(touchpad.values['send-events'] === 'disabled');

	async function setScrolling(method: 'fingers' | 'edge') {
		await touchpad.set('two-finger-scrolling-enabled', method === 'fingers');
		await touchpad.set('edge-scrolling-enabled', method === 'edge');
	}
</script>

<Section title={t('settings-mouse-touchpad')}>
	<Row title={t('settings-mouse-touchpad')}>
		<Switch label={t('settings-mouse-touchpad')} checked={!off} onchange={(on) => touchpad.set('send-events', on ? 'enabled' : 'disabled')} />
	</Row>
	<Row title={t('settings-mouse-speed')} disabled={off}>
		{#snippet below()}
			<SpeedSlider label={t('settings-mouse-touchpad-speed')} value={touchpad.values.speed ?? 0} disabled={off} onchange={(speed) => touchpad.set('speed', speed)} />
		{/snippet}
	</Row>
	<Row title={t('settings-mouse-touchpad-scroll-speed')} disabled={off}>
		{#snippet below()}
			<SpeedSlider
				label={t('settings-mouse-touchpad-scroll-speed-label')}
				value={Math.log2(touchpad.values['scroll-speed'] ?? 1)}
				min={-SCROLL_SPEED_OCTAVES}
				max={SCROLL_SPEED_OCTAVES}
				disabled={off}
				onchange={(octaves) => touchpad.set('scroll-speed', 2 ** octaves)}
			/>
		{/snippet}
	</Row>
	<Row title={t('settings-mouse-touchpad-tap')} description={t('settings-mouse-touchpad-tap-description')} disabled={off}>
		<Switch label={t('settings-mouse-touchpad-tap')} disabled={off} checked={touchpad.values['tap-to-click'] ?? false} onchange={(on) => touchpad.set('tap-to-click', on)} />
	</Row>
	<Row title={t('settings-mouse-natural-scrolling')} description={t('settings-mouse-touchpad-natural-scrolling-description')} disabled={off}>
		<Switch
			label={t('settings-mouse-touchpad-natural-scrolling')}
			disabled={off}
			checked={touchpad.values['natural-scroll'] ?? true}
			onchange={(on) => touchpad.set('natural-scroll', on)}
		/>
	</Row>
	<Row title={t('settings-mouse-touchpad-scroll-with')} disabled={off}>
		<div inert={off}>
			<Segmented
				label={t('settings-mouse-touchpad-scroll-with')}
				options={[
					{ value: 'fingers', label: t('settings-mouse-touchpad-two-fingers') },
					{ value: 'edge', label: t('settings-mouse-touchpad-scroll-edge') }
				]}
				value={touchpad.values['edge-scrolling-enabled'] && !touchpad.values['two-finger-scrolling-enabled'] ? 'edge' : 'fingers'}
				onchange={setScrolling}
			/>
		</div>
	</Row>
	<Row title={t('settings-mouse-touchpad-secondary-click')} description={t('settings-mouse-touchpad-secondary-click-description')} disabled={off}>
		<div inert={off}>
			<Segmented
				label={t('settings-mouse-touchpad-secondary-click')}
				options={[
					{ value: 'fingers', label: t('settings-mouse-touchpad-two-fingers') },
					{ value: 'areas', label: t('settings-mouse-touchpad-click-corner') }
				]}
				value={touchpad.values['click-method'] === 'areas' ? 'areas' : 'fingers'}
				onchange={(method) => touchpad.set('click-method', method)}
			/>
		</div>
	</Row>
	<Row title={t('settings-mouse-touchpad-disable-typing')} description={t('settings-mouse-touchpad-disable-typing-description')} disabled={off}>
		<Switch
			label={t('settings-mouse-touchpad-disable-typing')}
			disabled={off}
			checked={touchpad.values['disable-while-typing'] ?? true}
			onchange={(on) => touchpad.set('disable-while-typing', on)}
		/>
	</Row>
</Section>
