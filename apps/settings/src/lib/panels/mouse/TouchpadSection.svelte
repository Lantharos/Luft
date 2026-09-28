<script lang="ts">
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import SpeedSlider from './SpeedSlider.svelte';

	type Touchpad = {
		'send-events': string;
		speed: number;
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
		'tap-to-click',
		'natural-scroll',
		'two-finger-scrolling-enabled',
		'edge-scrolling-enabled',
		'disable-while-typing',
		'click-method'
	]);

	let off = $derived(touchpad.values['send-events'] === 'disabled');

	async function setScrolling(method: 'fingers' | 'edge') {
		await touchpad.set('two-finger-scrolling-enabled', method === 'fingers');
		await touchpad.set('edge-scrolling-enabled', method === 'edge');
	}
</script>

<Section title="Touchpad">
	<Row title="Touchpad">
		<Switch label="Touchpad" checked={!off} onchange={(on) => touchpad.set('send-events', on ? 'enabled' : 'disabled')} />
	</Row>
	<Row title="Pointer speed" disabled={off}>
		{#snippet below()}
			<SpeedSlider label="Touchpad pointer speed" value={touchpad.values.speed ?? 0} disabled={off} onchange={(speed) => touchpad.set('speed', speed)} />
		{/snippet}
	</Row>
	<Row title="Tap to click" description="Tap the touchpad instead of pressing it down" disabled={off}>
		<Switch label="Tap to click" disabled={off} checked={touchpad.values['tap-to-click'] ?? false} onchange={(on) => touchpad.set('tap-to-click', on)} />
	</Row>
	<Row title="Natural scrolling" description="Content moves in the same direction as your fingers" disabled={off}>
		<Switch
			label="Touchpad natural scrolling"
			disabled={off}
			checked={touchpad.values['natural-scroll'] ?? true}
			onchange={(on) => touchpad.set('natural-scroll', on)}
		/>
	</Row>
	<Row title="Scroll with" disabled={off}>
		<div inert={off}>
			<Segmented
				label="Scroll with"
				options={[
					{ value: 'fingers', label: 'Two fingers' },
					{ value: 'edge', label: 'Edge' }
				]}
				value={touchpad.values['edge-scrolling-enabled'] && !touchpad.values['two-finger-scrolling-enabled'] ? 'edge' : 'fingers'}
				onchange={setScrolling}
			/>
		</div>
	</Row>
	<Row title="Secondary click" description="How to right-click without a separate button" disabled={off}>
		<div inert={off}>
			<Segmented
				label="Secondary click"
				options={[
					{ value: 'fingers', label: 'Two fingers' },
					{ value: 'areas', label: 'Corner' }
				]}
				value={touchpad.values['click-method'] === 'areas' ? 'areas' : 'fingers'}
				onchange={(method) => touchpad.set('click-method', method)}
			/>
		</div>
	</Row>
	<Row title="Disable while typing" description="Ignores the touchpad while you type so the pointer doesn't jump" disabled={off}>
		<Switch
			label="Disable while typing"
			disabled={off}
			checked={touchpad.values['disable-while-typing'] ?? true}
			onchange={(on) => touchpad.set('disable-while-typing', on)}
		/>
	</Row>
</Section>
