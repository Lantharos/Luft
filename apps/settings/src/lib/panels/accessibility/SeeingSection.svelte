<script lang="ts">
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { CURSOR_SIZES } from '../appearance/cursors/sizes';
	import { screenReaderInstalled } from './api';

	type Applications = {
		'screen-reader-enabled': boolean;
		'screen-magnifier-enabled': boolean;
	};

	type Interface = {
		'text-scaling-factor': number;
		'enable-animations': boolean;
		'cursor-size': number;
	};

	const LARGE_TEXT = 1.25;

	const applications = useSettings<Applications>('org.gnome.desktop.a11y.applications', ['screen-reader-enabled', 'screen-magnifier-enabled']);
	const magnifier = useSettings<{ 'mag-factor': number }>('org.gnome.desktop.a11y.magnifier', ['mag-factor']);
	const contrast = useSettings<{ 'high-contrast': boolean }>('org.gnome.desktop.a11y.interface', ['high-contrast']);
	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'enable-animations', 'cursor-size']);

	let readerInstalled = $state(false);
	let zoomed = $derived(applications.values['screen-magnifier-enabled'] ?? false);

	const times = (factor: number) => `${Number(factor.toFixed(2))}×`;

	void screenReaderInstalled().then((installed) => (readerInstalled = installed));
</script>

<Section title="Seeing">
	{#if readerInstalled}
		<Row title="Screen reader">
			<Switch
				label="Screen reader"
				checked={applications.values['screen-reader-enabled'] ?? false}
				onchange={(on) => applications.set('screen-reader-enabled', on)}
			/>
		</Row>
	{/if}
	<Row title="Zoom">
		<Switch label="Zoom" checked={zoomed} onchange={(on) => applications.set('screen-magnifier-enabled', on)} />
	</Row>
	{#if zoomed}
		<Row title="Zoom level">
			<span class="w-12 text-right tabular-nums">{times(magnifier.values['mag-factor'] ?? 2)}</span>
			{#snippet below()}
				<Slider
					label="Zoom level"
					min={1.25}
					max={8}
					step={0.25}
					value={magnifier.values['mag-factor'] ?? 2}
					format={times}
					onchange={(factor) => magnifier.set('mag-factor', factor)}
				/>
			{/snippet}
		</Row>
	{/if}
	<Row title="Large text">
		<Switch
			label="Large text"
			checked={(desktop.values['text-scaling-factor'] ?? 1) > 1}
			onchange={(on) => (on ? desktop.set('text-scaling-factor', LARGE_TEXT) : desktop.reset('text-scaling-factor'))}
		/>
	</Row>
	<Row title="High contrast">
		<Switch label="High contrast" checked={contrast.values['high-contrast'] ?? false} onchange={(on) => contrast.set('high-contrast', on)} />
	</Row>
	<Row title="Reduce animations">
		<Switch
			label="Reduce animations"
			checked={!(desktop.values['enable-animations'] ?? true)}
			onchange={(on) => desktop.set('enable-animations', !on)}
		/>
	</Row>
	<Row title="Cursor size">
		<Select label="Cursor size" options={CURSOR_SIZES} value={desktop.values['cursor-size'] ?? 24} onchange={(size) => desktop.set('cursor-size', size)} />
	</Row>
</Section>
