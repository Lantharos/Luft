<script lang="ts">
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import SpeedSlider from './SpeedSlider.svelte';
	import TouchpadSection from './TouchpadSection.svelte';

	type Mouse = {
		'left-handed': boolean;
		speed: number;
		'accel-profile': string;
		'natural-scroll': boolean;
	};

	const mouse = useSettings<Mouse>('org.gnome.desktop.peripherals.mouse', ['left-handed', 'speed', 'accel-profile', 'natural-scroll']);
</script>

{#if hardware.present?.mouse}
	<Section title="Mouse">
		<Row title="Primary button" description="The button you click to select things">
			<Segmented
				label="Primary button"
				options={[
					{ value: 'left', label: 'Left' },
					{ value: 'right', label: 'Right' }
				]}
				value={mouse.values['left-handed'] ? 'right' : 'left'}
				onchange={(button) => mouse.set('left-handed', button === 'right')}
			/>
		</Row>
		<Row title="Pointer speed">
			{#snippet below()}
				<SpeedSlider label="Pointer speed" value={mouse.values.speed ?? 0} onchange={(speed) => mouse.set('speed', speed)} />
			{/snippet}
		</Row>
		<Row title="Mouse acceleration" description="The pointer travels farther when you move the mouse quickly">
			<Switch
				label="Mouse acceleration"
				checked={mouse.values['accel-profile'] !== 'flat'}
				onchange={(on) => mouse.set('accel-profile', on ? 'default' : 'flat')}
			/>
		</Row>
		<Row title="Natural scrolling" description="Scrolling moves the content instead of the view">
			<Switch label="Natural scrolling" checked={mouse.values['natural-scroll'] ?? false} onchange={(on) => mouse.set('natural-scroll', on)} />
		</Row>
	</Section>
{/if}

{#if hardware.present?.touchpad}
	<TouchpadSection />
{/if}

