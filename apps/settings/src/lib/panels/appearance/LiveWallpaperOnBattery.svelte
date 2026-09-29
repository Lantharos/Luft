<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { powerState } from '../power/api';

	const kestrel = useSettings<{ 'live-wallpaper-on-battery': boolean }>('dev.lantharos.kestrel', ['live-wallpaper-on-battery']);

	let hasBattery = $state(false);

	void powerState().then((state) => (hasBattery = !!state.battery));
</script>

{#if hasBattery}
	<Row title="Play videos on battery" description="Otherwise video wallpapers pause until you plug in">
		<Switch
			label="Play videos on battery"
			checked={kestrel.values['live-wallpaper-on-battery'] ?? false}
			onchange={(on) => kestrel.set('live-wallpaper-on-battery', on)}
		/>
	</Row>
{/if}
