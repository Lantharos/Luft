<script lang="ts">
	import { Dialog, PasswordField } from '@luft/ui';
	import { unlockPrompt } from './unlock.svelte';

	let { rejected }: { rejected: string | null } = $props();

	let unlock = $state('');

	const answer = (value: string | null) => unlockPrompt.request?.answer(value);
	const submit = () => unlock && answer(unlock);
</script>

<Dialog
	title="Unlock your disk"
	description="This change needs your recovery key, or the passphrase you type when the computer starts."
	onclose={() => answer(null)}
>
	<PasswordField
		label="Recovery key or passphrase"
		bind:value={unlock}
		error={rejected ?? ''}
		live
		onkeydown={(event) => event.key === 'Enter' && submit()}
	/>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => answer(null)}>Cancel</button>
		<button type="button" class="button primary" disabled={!unlock} onclick={submit}>Continue</button>
	{/snippet}
</Dialog>
