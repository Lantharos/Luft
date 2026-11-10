<script lang="ts">
	import { Dialog } from '@luft/ui';

	interface Props {
		count: number;
		onconfirm: () => void;
		onclose: () => void;
	}

	let { count, onconfirm, onclose }: Props = $props();

	let title = $derived(count === 1 ? 'Delete this item for good?' : `Delete ${count} items for good?`);

	function confirm() {
		onconfirm();
		onclose();
	}
</script>

<Dialog {title} description="This can't be undone." {onclose}>
	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button danger" type="button" onclick={confirm}>Delete</button>
	{/snippet}
</Dialog>
