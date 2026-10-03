<script lang="ts">
	import { Row, TextField } from '@luft/ui';
	import * as api from '#lib/api/index.js';
	import type { Account } from '#lib/api/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import Identities from './Identities.svelte';

	interface Props {
		account: Account;
	}

	let { account }: Props = $props();

	let open = $state(false);
	let name = $derived(account.name);
	let confirming = $state(false);

	let kind = $derived(account.config.protocol.kind === 'jmap' ? 'JMAP' : account.config.oauth ? `Signed in with ${account.config.oauth === 'google' ? 'Google' : 'Microsoft'}` : 'IMAP and SMTP');

	async function rename() {
		const renamed = name.trim() || account.email;
		if (renamed === account.name) return;
		await api.renameAccount(account.id, renamed);
		await mail.reloadAccounts();
	}

	function toggle() {
		if (open) void rename();
		open = !open;
	}

	async function remove() {
		await api.removeAccount(account.id);
		await mail.reloadAccounts();
		toasts.show(`${account.email} was removed from Mailman`);
	}
</script>

<Row title={account.name || account.email} description="{account.email} · {kind}" expanded={open} onclick={toggle}>
	{#snippet below()}
		{#if open}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class="flex flex-col gap-3 pt-1" onclick={(event) => event.stopPropagation()}>
				<TextField bind:value={name} label="Account name" showLabel onkeydown={(event) => event.key === 'Enter' && void rename()} />
				<Identities {account} />
				<div class="flex gap-2">
					<span class="flex-1"></span>
					{#if confirming}
						<button type="button" class="button" onclick={() => (confirming = false)}>Keep</button>
						<button type="button" class="button danger" onclick={() => void remove()}>Remove and forget its mail</button>
					{:else}
						<button type="button" class="button danger" onclick={() => (confirming = true)}>Remove</button>
					{/if}
				</div>
			</div>
		{/if}
	{/snippet}
</Row>
