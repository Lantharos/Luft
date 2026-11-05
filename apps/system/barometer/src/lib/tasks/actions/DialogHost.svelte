<script lang="ts">
	import { tasks } from './actions.svelte';
	import DetailsDialog from './DetailsDialog.svelte';
	import PriorityDialog from './PriorityDialog.svelte';
	import StuckDialog from './StuckDialog.svelte';
</script>

{#if tasks.details !== null}
	<DetailsDialog pid={tasks.details} />
{/if}
{#if tasks.priority}
	<PriorityDialog {...tasks.priority} />
{/if}
{#if tasks.stuck}
	<StuckDialog target={tasks.stuck} />
{/if}
