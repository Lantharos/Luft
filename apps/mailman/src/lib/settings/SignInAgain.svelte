<script lang="ts">
	import { Dialog, errorText, PasswordField } from '@luft/ui';
	import type { Account, NewSecret } from '#lib/bindings.js';
	import * as api from '#lib/bridge/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import { PROVIDER_NAMES } from './providers.js';

	interface Props {
		account: Account;
		onclose: () => void;
	}

	let { account, onclose }: Props = $props();

	let password = $state('');
	let field = $state<PasswordField>();
	let busy = $state(false);
	let error = $state('');

	let provider = $derived(account.config.oauth !== null && mail.oauth.includes(account.config.oauth) ? account.config.oauth : null);

	$effect(() => field?.focus());

	async function signIn() {
		if (!provider && !password) return (error = 'Enter the password or app password for this account');
		error = '';
		busy = true;
		try {
			const secret: NewSecret = provider ? { kind: 'oAuth', provider } : { kind: 'password', password };
			await api.signInAgain(account.id, secret);
			toasts.show(`Signed in to ${account.email}`);
			onclose();
		} catch (failure) {
			error = errorText(failure);
		} finally {
			busy = false;
		}
	}

	function submit(event: KeyboardEvent) {
		if (event.key !== 'Enter' || busy) return;
		event.preventDefault();
		void signIn();
	}
</script>

<Dialog title="Sign in again" description={account.email} {onclose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex flex-col gap-3" onkeydown={submit}>
		{#if provider}
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">
				Your browser opens so you can sign in with {PROVIDER_NAMES[provider]}. Mailman never sees your password.
			</p>
		{:else}
			<PasswordField bind:this={field} bind:value={password} label="Password" showLabel placeholder="Password or app password" autocomplete="current-password" />
		{/if}
		{#if error}
			<p class="px-1 text-[12.5px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={busy} onclick={() => void signIn()}>
			{#if busy}
				{provider ? 'Waiting for sign-in…' : 'Connecting…'}
			{:else}
				{provider ? `Continue with ${PROVIDER_NAMES[provider]}` : 'Sign in'}
			{/if}
		</button>
	{/snippet}
</Dialog>
