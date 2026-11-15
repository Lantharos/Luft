<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, Dialog, errorText, PasswordField, Segmented, Spinner, TextField } from '@luft/ui';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { commands } from '#lib/bindings.js';
	import type { AccountConfig, NewSecret, Provider, Server } from '#lib/bindings.js';
	import * as api from '#lib/bridge/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import { PROVIDER_NAMES } from './providers.js';
	import ServerFields from './ServerFields.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

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
	let confirming = $state(false);

	let canOAuth = $derived(oauth !== null && mail.oauth.includes(oauth) && !usePassword);
	let unencrypted = $derived(protocol === 'jmap' ? !session.trim().startsWith('https://') : imap.security === 'none' || smtp.security === 'none');
	let exposed = $derived(protocol === 'jmap' ? session.trim() : [imap, smtp].filter((server) => server.security === 'none').map((server) => server.host)[0]);

	async function lookUp() {
		if (!VALID.test(email.trim())) return (error = t('mailman-add-invalid-email'));
		error = '';
		busy = true;
		const found = await commands
			.discover({ email: email.trim() }, api.LONG)
			.catch((failure: unknown) => ((error = errorText(failure)), null))
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

	function add() {
		if (!canOAuth && !password) return (error = t('mailman-add-password-missing'));
		if (unencrypted) return (confirming = true);
		return connect();
	}

	async function connect() {
		error = '';
		busy = true;
		try {
			const secret: NewSecret = canOAuth ? { kind: 'oAuth', provider: oauth! } : { kind: 'password', password };
			const account = await api.addAccount(email.trim(), name.trim(), config(), secret, unencrypted);
			await mail.reloadAccounts();
			toasts.show(t('mailman-add-ready', { email: account.email }));
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
		void (step === 'email' ? lookUp() : add());
	}
</script>

<Dialog title={t('mailman-add-title')} description={step === 'email' ? t('mailman-add-description') : email} wide={showServers} {onclose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex flex-col gap-3" onkeydown={submit}>
		{#if step === 'email'}
			<TextField bind:value={name} label={t('mailman-add-your-name')} showLabel placeholder={t('mailman-add-name-placeholder')} autocomplete="name" />
			<TextField bind:value={email} label={t('mailman-add-email')} showLabel placeholder={t('mailman-add-email-placeholder')} inputmode="email" autocomplete="email" />
		{:else}
			{#if canOAuth}
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">
					{t('mailman-add-oauth', { provider: PROVIDER_NAMES[oauth!] })}
				</p>
				<button type="button" class="plain-button self-start" onclick={() => (usePassword = true)}>{t('mailman-add-use-password')}</button>
			{:else}
				<PasswordField bind:value={password} label={t('mailman-add-password')} showLabel placeholder={t('mailman-add-password-placeholder')} autocomplete="current-password" />
			{/if}
			<button type="button" class="disclosure" onclick={() => (showServers = !showServers)}>
				<ChevronRight size={16} class={['transition-transform duration-200', showServers && 'rotate-90']} />
				{t('mailman-add-servers')}
			</button>
			{#if showServers}
				<Segmented
					options={[
						{ value: 'imap', label: t('mailman-add-imap') },
						{ value: 'jmap', label: 'JMAP' }
					]}
					value={protocol}
					label={t('mailman-add-protocol')}
					onchange={(value) => (protocol = value)}
				/>
				<TextField bind:value={username} label={t('mailman-add-username')} showLabel />
				{#if protocol === 'imap'}
					<ServerFields kind="incoming" bind:server={imap} />
					<ServerFields kind="outgoing" bind:server={smtp} />
				{:else}
					<TextField bind:value={session} label={t('mailman-add-session')} showLabel placeholder="https://api.example.com/jmap/session" type="url" />
				{/if}
			{/if}
		{/if}
		{#if error}
			<p class="px-1 text-[12.5px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	</div>
	{#snippet actions()}
		{#if step === 'sign-in'}
			<button type="button" class="button" disabled={busy} onclick={() => ((step = 'email'), (error = ''))}>{t('mailman-add-back')}</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>{t('mailman-add-cancel')}</button>
		{/if}
		<button type="button" class="button primary" disabled={busy} onclick={() => void (step === 'email' ? lookUp() : add())}>
			{#if busy}
				<Spinner />
				{step === 'email' ? t('mailman-add-looking-up') : canOAuth ? t('mailman-add-waiting') : t('mailman-add-connecting')}
			{:else}
				{step === 'email' ? t('mailman-add-continue') : canOAuth ? t('mailman-add-continue-with', { provider: PROVIDER_NAMES[oauth!] }) : t('mailman-add-add')}
			{/if}
		</button>
	{/snippet}
</Dialog>

{#if confirming}
	<ConfirmDialog
		title={t('mailman-add-unencrypted-title')}
		description={t('mailman-add-unencrypted-description', { server: exposed })}
		action={t('mailman-add-unencrypted-action')}
		danger
		run={async () => void connect()}
		onclose={() => (confirming = false)}
	/>
{/if}

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
