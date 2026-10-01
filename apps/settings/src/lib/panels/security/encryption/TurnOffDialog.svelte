<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { problem, turnOffEncryption } from '../api';
	import { withUnlock } from './unlock.svelte';

	let { onclose }: { onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	async function turnOff() {
		busy = true;
		error = '';
		try {
			if (await withUnlock(turnOffEncryption)) onclose();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

<Dialog
	title="Turn off device encryption?"
	description="Your files are decrypted in the background while you keep working. Afterwards, anyone who takes out the disk can read what’s on it, and your recovery key is no longer needed."
	onclose={() => !busy && onclose()}
>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>Keep encryption</button>
		<button type="button" class="button danger" disabled={busy} onclick={turnOff}>{busy ? 'Turning off…' : 'Turn off'}</button>
	{/snippet}
</Dialog>
