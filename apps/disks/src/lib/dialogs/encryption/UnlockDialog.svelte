<script lang="ts">
	import { tick } from 'svelte';
	import { Checkbox, Dialog, errorText, PasswordField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { volumeName } from '#lib/format.js';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let passphrase = $state('');
	let remember = $state(false);
	let error = $state('');
	let working = $state(false);
	let field = $state<{ focus: () => void }>();

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	async function submit() {
		if (!passphrase || working) return;
		working = true;
		error = '';
		try {
			const outcome = await commands.disksUnlock({ block: volume.block, passphrase, remember }, WAIT);
			if ('wrongKey' in outcome) error = 'That passphrase isn’t right';
			else onclose();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) error = message;
		} finally {
			working = false;
		}
	}
</script>

<Dialog title="Unlock “{volumeName(volume)}”" {onclose}>
	<PasswordField bind:this={field} label="Passphrase" bind:value={passphrase} {error} live autocomplete="current-password" onkeydown={(event) => event.key === 'Enter' && submit()} />
	<Checkbox label="Remember in my keyring" checked={remember} onchange={(value) => (remember = value)}>Remember in my keyring</Checkbox>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!passphrase || working} onclick={submit}>{working ? 'Unlocking…' : 'Unlock'}</button>
	{/snippet}
</Dialog>
