<script lang="ts">
	import { Dialog, PasswordField, Segmented, TextField } from '@luft/ui';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import * as api from '$lib/api';
	import type { AccountConfig, Provider, Server } from '$lib/api';
	import { mail } from '$lib/mail/mail.svelte';
	import { toasts } from '$lib/shell/toasts.svelte';
	import ServerFields from './ServerFields.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const PROVIDER_NAMES: Record<Provider, string> = { google: 'Google', microsoft: 'Microsoft' };
	const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let step = $state<'email' | 'sign-in'>('email');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let username = $state('');
	let protocol = $state<'imap' | 'jmap'>('imap');
	let imap = $state<Server>({ host: '', port: 993, security: 'tls' });
	let smtp = $state<Server>({ host: '', port: 465, security: 'tls' });
	let session = $state('');
	let oauth = $state<Provider | null>(null);
	let usePassword = $state(false);
	let showServers = $state(false);
	let busy = $state(false);
	let error = $state('');

	let canOAuth = $derived(oauth !== null && mail.oauth.includes(oauth) && !usePassword);

	async function lookUp() {
		if (!VALID.test(email.trim())) return (error = 'Enter your full email address');
		error = '';
		busy = true;
		const found = await api
			.discover(email.trim())
			.catch((failure: unknown) => ((error = failure instanceof Error ? failure.message : String(failure)), null))
			.finally(() => (busy = false));
		if (!found) return;
		username = found.username || email.trim();
		oauth = found.oauth;
		if (found.jmap) {
			protocol = 'jmap';
			session = found.jmap;
		}
		if (found.imap) imap = found.imap;
		if (found.smtp) smtp = found.smtp;
		showServers = !found.imap && !found.jmap;
		step = 'sign-in';
	}

	function config(): AccountConfig {
		return {
			protocol: protocol === 'jmap' ? { kind: 'jmap', session } : { kind: 'imap', imap, smtp },
			username: username.trim() || email.trim(),
			oauth: canOAuth ? oauth : null
		};
	}

	async function add() {
		if (!canOAuth && !password) return (error = 'Enter the password or app password for this account');
		error = '';
		busy = true;
		try {
			const secret: api.Secret = canOAuth ? { kind: 'oAuth', provider: oauth! } : { kind: 'password', password };
			const account = await api.addAccount(email.trim(), name.trim(), config(), secret);
			await mail.reloadAccounts();
			toasts.show(`${account.email} is ready`);
			onclose();
		} catch (failure) {
			error = failure instanceof Error ? failure.message : String(failure);
		} finally {
			busy = false;
		}
	}

	function submit(event: KeyboardEvent) {
		if (event.key !== 'Enter' || busy) return;
		event.preventDefault();
		void (step === 'email' ? lookUp() : add());
	}
</script>

<Dialog title="Add an account" description={step === 'email' ? 'Mailman finds the right servers for most providers on its own.' : email} wide={showServers} {onclose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex flex-col gap-3" onkeydown={submit}>
		{#if step === 'email'}
			<TextField bind:value={name} label="Your name" showLabel placeholder="Ada Lovelace" autocomplete="name" />
			<TextField bind:value={email} label="Email address" showLabel placeholder="you@example.com" inputmode="email" autocomplete="email" />
		{:else}
			{#if canOAuth}
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">
					Your browser opens so you can sign in with {PROVIDER_NAMES[oauth!]}. Mailman never sees your password.
				</p>
				<button type="button" class="plain-button self-start" onclick={() => (usePassword = true)}>Use an app password instead</button>
			{:else}
				<PasswordField bind:value={password} label="Password" showLabel placeholder="Password or app password" autocomplete="current-password" />
			{/if}
			<button type="button" class="disclosure" onclick={() => (showServers = !showServers)}>
				<ChevronRight size={16} class={['transition-transform duration-200', showServers && 'rotate-90']} />
				Server settings
			</button>
			{#if showServers}
				<Segmented
					options={[
						{ value: 'imap', label: 'IMAP and SMTP' },
						{ value: 'jmap', label: 'JMAP' }
					]}
					value={protocol}
					label="Protocol"
					onchange={(value) => (protocol = value)}
				/>
				<TextField bind:value={username} label="User name" showLabel />
				{#if protocol === 'imap'}
					<ServerFields title="Incoming" bind:server={imap} />
					<ServerFields title="Outgoing" bind:server={smtp} />
				{:else}
					<TextField bind:value={session} label="Session address" showLabel placeholder="https://api.example.com/jmap/session" type="url" />
				{/if}
			{/if}
		{/if}
		{#if error}
			<p class="px-1 text-[12.5px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	</div>
	{#snippet actions()}
		{#if step === 'sign-in'}
			<button type="button" class="button" disabled={busy} onclick={() => ((step = 'email'), (error = ''))}>Back</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
		{/if}
		<button type="button" class="button primary" disabled={busy} onclick={() => void (step === 'email' ? lookUp() : add())}>
			{#if busy}
				{step === 'email' ? 'Looking up…' : canOAuth ? 'Waiting for sign-in…' : 'Connecting…'}
			{:else}
				{step === 'email' ? 'Continue' : canOAuth ? `Continue with ${PROVIDER_NAMES[oauth!]}` : 'Add account'}
			{/if}
		</button>
	{/snippet}
</Dialog>

<style>
	.disclosure {
		display: flex;
		align-items: center;
		gap: 6px;
		align-self: flex-start;
		border-radius: var(--radius-pill);
		padding: 6px 10px 6px 4px;
		font-size: 13px;
		color: var(--text-soft);
	}

	.disclosure:hover {
		color: var(--text);
	}
</style>
