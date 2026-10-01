<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, TextField } from '@luft/ui';
	import { accountLabel, renamePasskey, siteLabel, type Passkey } from './api';

	let { passkey, onclose }: { passkey: Passkey; onclose: () => void } = $props();

	let name = $state(untrack(() => passkey.nickname));
	let busy = $state(false);
	let error = $state('');

	async function save() {
		busy = true;
		error = '';
		try {
			await renamePasskey(passkey.id, name);
			onclose();
		} catch (reason) {
			error = reason instanceof Error ? reason.message : String(reason);
			busy = false;
		}
	}
</script>

<Dialog title="Rename passkey" description="Give your passkey for {siteLabel(passkey)} a name you’ll recognize." {onclose}>
	<TextField
		label="Name"
		bind:value={name}
		placeholder={passkey.displayName || passkey.account || accountLabel(passkey)}
		{error}
		live
		disabled={busy}
		onkeydown={(event) => event.key === 'Enter' && save()}
	/>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={busy} onclick={save}>Save</button>
	{/snippet}
</Dialog>
