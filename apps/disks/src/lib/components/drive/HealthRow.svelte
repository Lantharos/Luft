<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Row } from '@luft/ui';
	import type { Drive, Health } from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { healthSummary, healthTitle } from '$lib/format';

	interface Props {
		drive: Drive;
		health: Health;
	}

	let { drive, health }: Props = $props();
</script>

<div class={['health row-group', health.state]}>
	<Row title={healthTitle(health)} icon={health.state === 'good' ? CircleCheck : TriangleAlert} onclick={() => dialogs.open({ kind: 'health', drive })}>
		<span class="tabular-nums">{healthSummary(health)}</span>
	</Row>
</div>

<style>
	.health :global(.icon) {
		color: var(--success);
	}

	.health.warning :global(.icon),
	.health.failing :global(.icon),
	.health.failing :global(.title) {
		color: var(--danger);
	}
</style>
