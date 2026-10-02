<script lang="ts">
	import { Row, TextField } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Account } from '$lib/api';
	import { mail } from '$lib/mail/mail.svelte';
	import { toasts } from '$lib/shell/toasts.svelte';

	interface Props {
		account: Account;
	}

	let { account }: Props = $props();

	let open = $state(false);
	let name = $derived(account.name);
	let signature = $derived(account.signature);
	let confirming = $state(false);

	let kind = $derived(account.config.protocol.kind === 'jmap' ? 'JMAP' : account.config.oauth ? `Signed in with ${account.config.oauth === 'google' ? 'Google' : 'Microsoft'}` : 'IMAP and SMTP');

	async function save() {
		await api.updateAccount(account.id, name.trim() || account.email, signature);
		await mail.reloadAccounts();
		toasts.show('Saved');
	}

	async function remove() {
		await api.removeAccount(account.id);
		await mail.reloadAccounts();
		toasts.show(`${account.email} was removed from Mailman`);
	}
</script>

<Row title={account.name || account.email} description="{account.email} · {kind}" expanded={open} onclick={() => (open = !open)}>
	{#snippet below()}
		{#if open}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class="flex flex-col gap-3 pt-1" onclick={(event) => event.stopPropagation()}>
				<TextField bind:value={name} label="Name others see" showLabel />
				<label class="flex flex-col gap-1.5">
					<span class="px-1 text-[13px] text-[var(--text-soft)]">Signature</span>
					<textarea bind:value={signature} rows="3" class="signature" placeholder="Added below new messages"></textarea>
				</label>
				<div class="flex gap-2">
					<button type="button" class="button primary" onclick={() => void save()}>Save</button>
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

<style>
	.signature {
		resize: none;
		border-radius: 16px;
		background: var(--control);
		padding: 10px 14px;
		font-size: 13px;
		line-height: 1.5;
		outline: none;
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	.signature:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}
</style>
