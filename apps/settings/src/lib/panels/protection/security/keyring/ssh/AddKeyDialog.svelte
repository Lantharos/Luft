<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, Switch, TextField } from '@luft/ui';
	import { generateKey, problem } from '../api';

	interface Props {
		chipKeys: boolean;
		refresh: () => Promise<void>;
		onclose: () => void;
	}

	let { chipKeys, refresh, onclose }: Props = $props();

	let name = $state('');
	let chip = $state(untrack(() => chipKeys));
	let busy = $state(false);
	let error = $state('');

	let ready = $derived(name.trim().length > 0 && !busy);

	async function add() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			await generateKey(name.trim(), chip);
			await refresh();
			onclose();
		} catch (reason) {
			error = problem(reason);
			busy = false;
		}
	}
</script>

<Dialog title="Add an SSH key" description="A new key is made on this computer. Copy its public key to the servers you want to sign in to." onclose={() => !busy && onclose()}>
	<TextField
		bind:value={name}
		label="Name"
		showLabel
		placeholder="For example, work laptop"
		disabled={busy}
		onkeydown={(event) => event.key === 'Enter' && add()}
	/>
	<div class="flex items-center gap-4 px-1">
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="text-[14px] font-medium">Keep it in the security chip</span>
			<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">
				{chipKeys ? 'It can never be copied off this computer, not even by you' : 'This computer’s security chip can’t hold SSH keys'}
			</span>
		</div>
		<Switch label="Keep it in the security chip" checked={chip} disabled={!chipKeys || busy} onchange={(on) => (chip = on)} />
	</div>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={add}>Add key</button>
	{/snippet}
</Dialog>
