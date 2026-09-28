<script lang="ts">
	import Row from '$lib/components/controls/Row.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { KESTREL_SCHEMA } from './api';

	interface Props {
		lockScreen: boolean;
	}

	let { lockScreen }: Props = $props();

	const kestrel = useSettings<{ 'lock-screen-content': boolean }>(KESTREL_SCHEMA, ['lock-screen-content']);
</script>

<Row title="Show message content" description="When off, only the app name is shown" disabled={!lockScreen}>
	<Switch
		label="Show message content on the lock screen"
		disabled={!lockScreen}
		checked={kestrel.values['lock-screen-content'] ?? true}
		onchange={(on) => kestrel.set('lock-screen-content', on)}
	/>
</Row>
