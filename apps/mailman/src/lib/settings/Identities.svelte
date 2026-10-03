<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { Account, Identity } from '#lib/api/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import IdentityEditor from './IdentityEditor.svelte';

	interface Props {
		account: Account;
	}

	let { account }: Props = $props();

	let editing = $state<Identity | null>(null);

	let identities = $derived(mail.identitiesOf(account.id));

	function blank(): Identity {
		return { id: 0, account: account.id, name: account.name, address: '', replyTo: '', signature: '', preferred: false, remote: null };
	}
</script>

<div class="flex flex-col gap-1.5">
	<span class="px-1 text-[13px] text-[var(--text-soft)]">Addresses you send from</span>
	{#each identities as identity (identity.id)}
		{#if editing?.id === identity.id}
			<IdentityEditor {identity} onclose={() => (editing = null)} />
		{:else}
			<button type="button" class="identity" onclick={() => (editing = identity)}>
				<span class="min-w-0 flex-1 truncate">
					{#if identity.name}<span class="font-medium">{identity.name}</span>{/if}
					<span class="text-[var(--text-soft)]">{identity.address}</span>
				</span>
				{#if identity.preferred}<span class="flex-none text-[12px] text-[var(--text-muted)]">Used by default</span>{/if}
			</button>
		{/if}
	{/each}
	{#if editing?.id === 0}
		<IdentityEditor identity={editing} onclose={() => (editing = null)} />
	{:else}
		<button type="button" class="plain-button add" onclick={() => (editing = blank())}><Plus size={15} />Add an address</button>
	{/if}
</div>

<style>
	.identity {
		display: flex;
		min-height: 40px;
		align-items: center;
		gap: 10px;
		border-radius: 14px;
		padding-inline: 12px;
		text-align: left;
		font-size: 13px;
	}

	.identity:hover {
		background: var(--surface-hover);
	}

	.add {
		align-self: flex-start;
		min-height: 32px;
		gap: 6px;
		padding-inline: 10px;
		font-size: 13px;
	}
</style>
