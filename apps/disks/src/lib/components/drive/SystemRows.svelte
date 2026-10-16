<script lang="ts">
	import Monitor from '@lucide/svelte/icons/monitor';
	import { Row } from '@luft/ui';
	import type { OtherSystem } from '#lib/api.js';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { summary } from '#lib/systems.js';

	interface Props {
		systems: OtherSystem[];
	}

	let { systems }: Props = $props();
</script>

<div class="row-group" role="list" aria-label="Other systems">
	{#each systems as system (system.id)}
		<div role="listitem">
			<Row title={system.name} description={summary(system)} icon={Monitor}>
				<button type="button" class="button" onclick={() => dialogs.open({ kind: 'remove-system', system })}>Remove</button>
			</Row>
		</div>
	{/each}
</div>
