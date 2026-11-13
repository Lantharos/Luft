<script lang="ts">
	import { Dialog } from '@luft/ui';

	interface Props {
		onconfirm: () => void;
		onclose: () => void;
	}

	let { onconfirm, onclose }: Props = $props();

	function confirm() {
		onconfirm();
		onclose();
	}
</script>

<Dialog title="Empty the trash?" description="Everything in it is deleted for good." {onclose}>
	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button danger" type="button" onclick={confirm}>Empty trash</button>
	{/snippet}
</Dialog>
