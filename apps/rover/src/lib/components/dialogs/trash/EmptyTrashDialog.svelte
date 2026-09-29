<script lang="ts">
	import { Dialog } from '@luft/ui';

	interface Props {
		onconfirm: () => void;
		onclose: () => void;
	}

	let { onconfirm, onclose }: Props = $props();

	function confirm() {
		onclose();
		onconfirm();
	}
</script>

<Dialog title="Empty the trash?" description="Everything in the trash will be deleted for good. This can't be undone." {onclose}>
	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button danger" type="button" onclick={confirm}>Empty trash</button>
	{/snippet}
</Dialog>
