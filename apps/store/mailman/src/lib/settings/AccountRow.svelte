<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Account } from '#lib/bindings.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import Identities from './Identities.svelte';
	import { PROVIDER_NAMES } from './providers.js';

	interface Props {
		account: Account;
	}

	let { account }: Props = $props();

	let open = $state(false);
	let name = $derived(account.name);
	let confirming = $state(false);

	let kind = $derived(account.config.protocol.kind === 'jmap' ? 'JMAP' : account.config.oauth ? t('mailman-account-oauth', { provider: PROVIDER_NAMES[account.config.oauth] }) : t('mailman-account-imap'));

	async function rename() {
		const renamed = name.trim() || account.email;
		if (renamed === account.name) return;
		await commands.renameAccount({ id: account.id, name: renamed });
		await mail.reloadAccounts();
	}

	function toggle() {
		if (open) void rename();
		open = !open;
	}

	async function remove() {
		await commands.removeAccount({ id: account.id });
		await mail.reloadAccounts();
		toasts.show(t('mailman-account-removed', { email: account.email }));
	}
</script>

{#snippet details()}
	<div class="flex flex-col gap-3 pt-1">
		<TextField bind:value={name} label={t('mailman-account-name')} showLabel onkeydown={(event) => event.key === 'Enter' && void rename()} />
		<Identities {account} />
		<div class="flex gap-2">
			<span class="flex-1"></span>
			{#if confirming}
				<button type="button" class="button" onclick={() => (confirming = false)}>{t('mailman-account-keep')}</button>
				<button type="button" class="button danger" onclick={() => void remove()}>{t('mailman-account-remove-confirm')}</button>
			{:else}
				<button type="button" class="button danger" onclick={() => (confirming = true)}>{t('mailman-account-remove')}</button>
			{/if}
		</div>
	</div>
{/snippet}

<Row title={account.name || account.email} description="{account.email} · {kind}" expanded={open} onclick={toggle} below={open ? details : undefined} />
