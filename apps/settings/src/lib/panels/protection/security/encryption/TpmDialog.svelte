<script lang="ts" module>
	export type TpmMode = 'setup' | 'add' | 'change' | 'relink';
</script>

<script lang="ts">
	import { Dialog, Switch } from '@luft/ui';
	import { problem, setUpTpmUnlock } from '../api';
	import PinFields from '../keys/PinFields.svelte';
	import { pinReady } from '../keys/pin';
	import { withUnlock } from './unlock.svelte';

	interface Props {
		mode: TpmMode;
		onclose: (recoveryKey?: string) => void;
	}

	const COPY: Record<TpmMode, { title: string; description: string; action: string }> = {
		setup: {
			title: 'Unlock with the security chip',
			description: 'The security chip in your computer unlocks the disk by itself at startup, so you no longer type a passphrase first.',
			action: 'Set up'
		},
		add: {
			title: 'Add a PIN',
			description: 'You’ll type it each time the computer starts. Without it, the disk stays locked, even if someone takes the whole computer.',
			action: 'Add PIN'
		},
		change: {
			title: 'Change your PIN',
			description: 'You’ll type the new PIN each time the computer starts.',
			action: 'Change PIN'
		},
		relink: {
			title: 'Link the security chip again',
			description: 'Type the PIN you’d like to use at startup.',
			action: 'Link again'
		}
	};

	let { mode, onclose }: Props = $props();

	let usePin = $state(false);
	let pin = $state('');
	let confirmation = $state('');
	let busy = $state(false);
	let error = $state('');

	let copy = $derived(COPY[mode]);
	let asking = $derived(mode !== 'setup' || usePin);
	let ready = $derived(!busy && (!asking || pinReady(pin, confirmation)));

	async function submit() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			const outcome = await withUnlock(setUpTpmUnlock(asking ? pin : ''));
			if (outcome) return onclose(outcome.done || undefined);
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

<Dialog title={copy.title} description={copy.description} onclose={() => !busy && onclose()}>
	{#if mode === 'setup'}
		<div class="flex items-center gap-4 px-1">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<span class="text-[14px] font-medium">Also ask for a PIN</span>
				<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">Adds a step at startup.</span>
			</div>
			<Switch label="Also ask for a PIN" checked={usePin} onchange={(on) => (usePin = on)} />
		</div>
	{/if}
	{#if asking}
		<PinFields label={mode === 'change' ? 'New PIN' : 'PIN'} bind:pin bind:confirmation onsubmit={submit} />
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={() => onclose()}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{copy.action}</button>
	{/snippet}
</Dialog>
