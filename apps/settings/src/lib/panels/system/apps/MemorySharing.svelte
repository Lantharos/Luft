<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	const kestrel = useSettings<{ 'share-app-memory': boolean }>('com.lantharos.kestrel', ['share-app-memory']);
</script>

<Section title="Memory">
	<Row title="Share memory between apps" description="Apps made for Luft keep one copy of the memory they have in common, so they use less. Web browsers never take part.">
		<Switch
			label="Share memory between apps"
			checked={kestrel.values['share-app-memory'] ?? true}
			onchange={(on) => kestrel.set('share-app-memory', on)}
		/>
	</Row>
</Section>
