<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import DelayRow from './DelayRow.svelte';

	type Mouse = {
		'dwell-click-enabled': boolean;
		'dwell-time': number;
		'secondary-click-enabled': boolean;
		'secondary-click-time': number;
	};

	const keyboard = useSettings<{ 'mousekeys-enable': boolean }>('org.gnome.desktop.a11y.keyboard', ['mousekeys-enable']);
	const mouse = useSettings<Mouse>('org.gnome.desktop.a11y.mouse', ['dwell-click-enabled', 'dwell-time', 'secondary-click-enabled', 'secondary-click-time']);
	const desktop = useSettings<{ 'locate-pointer': boolean }>('org.gnome.desktop.interface', ['locate-pointer']);

	let dwell = $derived(mouse.values['dwell-click-enabled'] ?? false);
	let secondary = $derived(mouse.values['secondary-click-enabled'] ?? false);
</script>

<Section title="Pointing">
	<Row title="Mouse keys">
		<Switch label="Mouse keys" checked={keyboard.values['mousekeys-enable'] ?? false} onchange={(on) => keyboard.set('mousekeys-enable', on)} />
	</Row>
	<Row title="Click by resting the pointer">
		<Switch label="Click by resting the pointer" checked={dwell} onchange={(on) => mouse.set('dwell-click-enabled', on)} />
	</Row>
	{#if dwell}
		<DelayRow title="Rest for" seconds={mouse.values['dwell-time'] ?? 1.2} min={0.2} max={3} onchange={(value) => mouse.set('dwell-time', value)} />
	{/if}
	<Row title="Hold to right-click">
		<Switch label="Hold to right-click" checked={secondary} onchange={(on) => mouse.set('secondary-click-enabled', on)} />
	</Row>
	{#if secondary}
		<DelayRow
			title="Hold for"
			seconds={mouse.values['secondary-click-time'] ?? 1.2}
			min={0.5}
			max={3}
			onchange={(value) => mouse.set('secondary-click-time', value)}
		/>
	{/if}
	<Row title="Press Ctrl to find the pointer">
		<Switch
			label="Press Ctrl to find the pointer"
			checked={desktop.values['locate-pointer'] ?? false}
			onchange={(on) => desktop.set('locate-pointer', on)}
		/>
	</Row>
</Section>
