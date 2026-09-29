<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { CloseReview } from '$lib/workspace/workspace.svelte';

	interface Props {
		review: CloseReview;
		onclose: () => void;
	}

	let { review, onclose }: Props = $props();

	let description = $derived(
		review.programs.length === 1
			? `${review.programs[0]} is still running and will be stopped.`
			: `${review.programs.join(', ')} are still running and will be stopped.`
	);

	function close() {
		onclose();
		review.close();
	}
</script>

<Dialog title="Close this terminal?" {description} {onclose}>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" onclick={close}>Close</button>
	{/snippet}
</Dialog>
