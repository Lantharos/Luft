<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { problem } from './api';

	interface Props {
		title: string;
		description: string;
		action: string;
		run: () => Promise<void>;
		onclose: () => void;
	}

	let { title, description, action, run, onclose }: Props = $props();

	let busy = $state(false);
	let error = $state('');

	async function confirm() {
		busy = true;
		error = '';
		try {
			await run();
			onclose();
		} catch (reason) {
			error = problem(reason);
			busy = false;
		}
	}
</script>

<Dialog {title} {description} onclose={() => !busy && onclose()}>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" disabled={busy} onclick={confirm}>{action}</button>
	{/snippet}
</Dialog>
