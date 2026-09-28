<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { untrack } from 'svelte';
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import Segmented from '$lib/components/controls/Segmented.svelte';
	import { forget, join, minimumPassword, needsPassword, onChanged, onFailed, type JoinSecurity } from './api';

	interface Props {
		device: string;
		ssid?: string;
		security?: JoinSecurity;
		replace?: boolean;
		problem?: string;
		onclose: () => void;
	}

	const HIDDEN_SECURITY: { value: JoinSecurity; label: string }[] = [
		{ value: 'open', label: 'None' },
		{ value: 'psk', label: 'WPA2' },
		{ value: 'sae', label: 'WPA3' }
	];

	let { device, ssid, security = 'psk', replace = false, problem = '', onclose }: Props = $props();

	const initial = untrack(() => ({ name: ssid ?? '', security, problem }));

	let hidden = $derived(ssid === undefined);
	let name = $state(initial.name);
	let choice = $state<JoinSecurity>(initial.security);
	let password = $state('');
	let reveal = $state(false);
	let busy = $state(false);
	let error = $state(initial.problem);

	let wantsPassword = $derived(needsPassword(choice));
	let ready = $derived(!busy && name.trim().length > 0 && (!wantsPassword || password.length >= minimumPassword(choice)));

	async function submit() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			if (replace) await forget(name);
			await join({ device, ssid: name.trim(), security: choice, password: wantsPassword ? password : '', hidden });
		} catch {
			error = "Couldn't connect to this network.";
			busy = false;
		}
	}

	$effect(() => {
		const stopFailed = onFailed((failure) => {
			if (!busy || failure.path !== device) return;
			busy = false;
			error = failure.reason === 'password' ? "That password didn't work. Check it and try again." : "Couldn't connect to this network.";
		});
		const stopChanged = onChanged((network) => {
			const joined = network.wifi?.networks.some((candidate) => candidate.ssid === name.trim() && candidate.state === 'connected');
			if (busy && joined) onclose();
		});
		return () => {
			stopFailed();
			stopChanged();
		};
	});
</script>

<Dialog
	title={hidden ? 'Connect to a hidden network' : `Connect to “${ssid}”`}
	description={hidden ? "Enter the network's name and how it's secured." : 'Enter the password for this network.'}
	{onclose}
>
	{#if hidden}
		<input class="text-field" placeholder="Network name" bind:value={name} onkeydown={(event) => event.key === 'Enter' && submit()} />
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px] text-[var(--text-soft)]">Security</span>
			<Segmented label="Security" options={HIDDEN_SECURITY} value={choice} onchange={(value) => (choice = value)} />
		</div>
	{/if}
	{#if wantsPassword}
		<div class="relative">
			<input
				class="text-field pr-11"
				type={reveal ? 'text' : 'password'}
				placeholder="Password"
				autocomplete="off"
				bind:value={password}
				onkeydown={(event) => event.key === 'Enter' && submit()}
			/>
			<button type="button" class="reveal" aria-label={reveal ? 'Hide password' : 'Show password'} onclick={() => (reveal = !reveal)}>
				{#if reveal}
					<EyeOff size={16} />
				{:else}
					<Eye size={16} />
				{/if}
			</button>
		</div>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{busy ? 'Connecting…' : 'Connect'}</button>
	{/snippet}
</Dialog>

<style>
	.reveal {
		position: absolute;
		top: 4px;
		right: 4px;
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition: background-color 160ms var(--ease), color 160ms var(--ease);
	}

	.reveal:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
