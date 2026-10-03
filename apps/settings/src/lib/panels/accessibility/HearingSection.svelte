<script lang="ts">
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	type Bell = {
		'visual-bell': boolean;
		'visual-bell-type': string;
	};

	const bell = useSettings<Bell>('org.gnome.desktop.wm.preferences', ['visual-bell', 'visual-bell-type']);

	let flashing = $derived(bell.values['visual-bell'] ?? false);
</script>

<Section title="Hearing">
	<Row title="Flash for alert sounds">
		<Switch label="Flash for alert sounds" checked={flashing} onchange={(on) => bell.set('visual-bell', on)} />
	</Row>
	{#if flashing}
		<Row title="Flash">
			<Segmented
				label="Flash"
				options={[
					{ value: 'frame-flash', label: 'Window' },
					{ value: 'fullscreen-flash', label: 'Screen' }
				]}
				value={bell.values['visual-bell-type'] === 'fullscreen-flash' ? 'fullscreen-flash' : 'frame-flash'}
				onchange={(type) => bell.set('visual-bell-type', type)}
			/>
		</Row>
	{/if}
</Section>
