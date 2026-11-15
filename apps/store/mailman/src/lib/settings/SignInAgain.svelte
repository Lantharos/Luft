<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, PasswordField, Spinner } from '@luft/ui';
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
		if (!provider && !password) return (error = t('mailman-add-password-missing'));
		error = '';
		busy = true;
		try {
			const secret: NewSecret = provider ? { kind: 'oAuth', provider } : { kind: 'password', password };
			await api.signInAgain(account.id, secret);
			toasts.show(t('mailman-sign-in-done', { email: account.email }));
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

<Dialog title={t('mailman-sign-in-title')} description={account.email} {onclose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex flex-col gap-3" onkeydown={submit}>
		{#if provider}
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">
				{t('mailman-add-oauth', { provider: PROVIDER_NAMES[provider] })}
			</p>
		{:else}
			<PasswordField bind:this={field} bind:value={password} label={t('mailman-add-password')} showLabel placeholder={t('mailman-add-password-placeholder')} autocomplete="current-password" />
		{/if}
		{#if error}
			<p class="px-1 text-[12.5px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('mailman-sign-in-cancel')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={() => void signIn()}>
			{#if busy}
				<Spinner />
				{provider ? t('mailman-add-waiting') : t('mailman-add-connecting')}
			{:else}
				{provider ? t('mailman-add-continue-with', { provider: PROVIDER_NAMES[provider] }) : t('mailman-sign-in')}
			{/if}
		</button>
	{/snippet}
</Dialog>
