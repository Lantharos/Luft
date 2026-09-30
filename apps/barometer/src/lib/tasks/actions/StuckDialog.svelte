<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { tasks, type Target } from './actions.svelte';

	interface Props {
		target: Target;
	}

	let { target }: Props = $props();
</script>

<Dialog
	title={`${target.title} isn't closing`}
	description="It's still running. Force quitting ends it right away, and anything unsaved in it is lost."
	onclose={() => (tasks.stuck = null)}
>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => (tasks.stuck = null)}>Wait</button>
		<button type="button" class="button danger" onclick={() => tasks.kill(target)}>Force quit</button>
	{/snippet}
</Dialog>
