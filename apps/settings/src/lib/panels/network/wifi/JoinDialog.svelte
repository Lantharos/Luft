<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, PasswordField, Segmented, TextField } from '@luft/ui';
	import EnterpriseFields from '../connection/EnterpriseFields.svelte';
	import { newEnterprise } from '../connection/profile';
	import { checkEnterprise, minimumPassword, type Errors } from '../connection/validate';
	import { forget, join, needsPassword, onChanged, onFailed, type Security } from '../api';

	interface Props {
		device: string;
		ssid?: string;
		security?: Security;
		replace?: boolean;
		problem?: string;
		onclose: () => void;
	}

	const HIDDEN_SECURITY: { value: Security; label: string }[] = [
		{ value: 'open', label: 'None' },
		{ value: 'psk', label: 'WPA2' },
		{ value: 'sae', label: 'WPA3' },
		{ value: 'enterprise', label: 'Enterprise' }
	];

	let { device, ssid, security = 'psk', replace = false, problem = '', onclose }: Props = $props();

	const initial = untrack(() => ({ name: ssid ?? '', security, problem }));

	let hidden = $derived(ssid === undefined);
	let name = $state(initial.name);
	let choice = $state<Security>(initial.security);
	let password = $state('');
	let enterprise = $state(newEnterprise());
	let busy = $state(false);
	let error = $state(initial.problem);

	let corporate = $derived(choice === 'enterprise');
	let errors = $derived(check());
	let ready = $derived(!busy && name.trim().length > 0 && Object.keys(errors).length === 0);

	function check() {
		const errors: Errors = {};
		if (corporate) {
			checkEnterprise(enterprise, errors);
			if (enterprise.method !== 'tls' && !password) errors.password = 'Enter your password';
		} else if (needsPassword(choice) && password.length < minimumPassword(choice)) {
			errors.password = `Use at least ${minimumPassword(choice)} characters`;
		}
		return errors;
	}

	async function submit() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			if (replace) await forget(name);
			await join({
				device,
				ssid: name.trim(),
				security: choice,
				password: needsPassword(choice) || corporate ? password : '',
				hidden,
				enterprise: corporate ? $state.snapshot(enterprise) : undefined
			});
		} catch {
			error = "Couldn't connect to this network.";
			busy = false;
		}
	}

	$effect(() => {
		const stopFailed = onFailed((failure) => {
			if (!busy || failure.path !== device) return;
			busy = false;
			if (failure.reason !== 'password') error = "Couldn't connect to this network.";
			else if (corporate) error = "Couldn't sign in. Check your username and password.";
			else error = "That password didn't work. Check it and try again.";
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
	description={hidden ? "Enter the network's name and how it's secured." : corporate ? 'Sign in with your work or school account.' : 'Enter the password for this network.'}
	wide={corporate}
	{onclose}
>
	{#if hidden}
		<TextField label="Network name" bind:value={name} placeholder="Network name" onkeydown={(event) => event.key === 'Enter' && submit()} />
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px] text-[var(--text-soft)]">Security</span>
			<Segmented label="Security" options={HIDDEN_SECURITY} value={choice} onchange={(value) => (choice = value)} />
		</div>
	{/if}
	{#if corporate}
		<div class="fields">
			<EnterpriseFields bind:enterprise bind:password {errors} />
		</div>
	{:else if needsPassword(choice)}
		<PasswordField label="Password" bind:value={password} placeholder="Password" error={errors.password} onkeydown={(event) => event.key === 'Enter' && submit()} />
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
	.fields {
		display: flex;
		flex-direction: column;
		margin-inline: -16px;
	}

	.fields > :global(* + *) {
		box-shadow: inset 0 1px 0 var(--hairline);
	}
</style>
