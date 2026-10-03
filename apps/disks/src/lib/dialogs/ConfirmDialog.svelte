<script lang="ts">
	import { Dialog } from '@luft/ui';

	interface Props {
		title: string;
		description: string;
		confirm: string;
		onconfirm: () => Promise<boolean>;
		onclose: () => void;
	}

	let { title, description, confirm, onconfirm, onclose }: Props = $props();

	let working = $state(false);

	async function submit() {
		working = true;
		const done = await onconfirm();
		working = false;
		if (done) onclose();
	}
</script>

<Dialog {title} {description} {onclose}>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" disabled={working} onclick={submit}>{confirm}</button>
	{/snippet}
</Dialog>
