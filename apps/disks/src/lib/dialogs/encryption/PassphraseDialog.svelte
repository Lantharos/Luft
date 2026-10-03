<script lang="ts">
	import { tick } from 'svelte';
	import { Dialog, PasswordField } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Volume } from '$lib/api';
	import { errorText, volumeName } from '$lib/format';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let current = $state('');
	let next = $state('');
	let confirm = $state('');
	let error = $state('');
	let working = $state(false);
	let field = $state<{ focus: () => void }>();

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	let mismatch = $derived(confirm.length > 0 && next !== confirm);
	let valid = $derived(current.length > 0 && next.length > 0 && next === confirm);

	async function submit() {
		if (!valid || working) return;
		working = true;
		error = '';
		try {
			await api.changePassphrase(volume.block, current, next);
			onclose();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== api.CANCELLED) error = /passphrase|key/i.test(message) ? 'The current passphrase isn’t right' : message;
		} finally {
			working = false;
		}
	}
</script>

<Dialog title="Change passphrase" description="For “{volumeName(volume)}”. Files on it stay as they are." {onclose}>
	<PasswordField bind:this={field} label="Current passphrase" bind:value={current} {error} live autocomplete="current-password" />
	<PasswordField label="New passphrase" bind:value={next} autocomplete="new-password" />
	<PasswordField label="Confirm new passphrase" bind:value={confirm} error={mismatch ? 'The passphrases don’t match' : ''} live autocomplete="new-password" onkeydown={(event) => event.key === 'Enter' && submit()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid || working} onclick={submit}>Change</button>
	{/snippet}
</Dialog>
