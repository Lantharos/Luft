<script lang="ts">
	import { tick } from 'svelte';
	import { MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Account, Identity } from '#lib/bridge/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import type { Composition } from './composer.svelte';
	import ComposeField from './ComposeField.svelte';
	import { covers, isAddress, isWildcard } from './identity';

	interface Props {
		composition: Composition;
		onchoose: (identity: Identity) => void;
	}

	let { composition, onchoose }: Props = $props();

	let input = $state<HTMLInputElement>();

	let identity = $derived(mail.identities.find((candidate) => candidate.id === composition.identity));
	let groups = $derived(mail.accounts.map((account) => ({ account, identities: sendable(account) })).filter((group) => group.identities.length));
	let choices = $derived(groups.reduce((total, group) => total + group.identities.length + Number(group.account.customFrom), 0));
	let typing = $derived(composition.from !== null);
	let typed = $derived(composition.from?.trim() ?? '');
	let mayBeRefused = $derived(typing && isAddress(typed) && !mail.identitiesOf(composition.account).some((own) => covers(own, typed)));
	let placeholder = $derived(identity && isWildcard(identity) ? `name${identity.address.slice(1)}` : 'Address to send from');

	function sendable(account: Account) {
		return mail.identitiesOf(account.id).toSorted((a, b) => Number(b.address === account.email) - Number(a.address === account.email) || a.address.localeCompare(b.address));
	}

	function describe(identity: Identity) {
		return isWildcard(identity) ? `Any address at ${identity.address.slice(2)}` : identity.address;
	}

	async function focusInput() {
		await tick();
		input?.focus();
	}

	function use(chosen: Identity, from: string | null) {
		const changed = chosen.id !== composition.identity;
		composition.account = chosen.account;
		composition.identity = chosen.id;
		composition.from = from;
		if (changed) onchoose(chosen);
	}

	function choose(chosen: Identity) {
		const wildcard = isWildcard(chosen);
		const kept = composition.from && wildcard && covers(chosen, composition.from) ? composition.from : '';
		use(chosen, wildcard ? kept : null);
		void mail.preferIdentity(chosen).catch(toasts.fail);
		if (wildcard) void focusInput();
	}

	function another(account: Account) {
		const own = mail.identitiesOf(account.id);
		const base = own.find((candidate) => candidate.preferred && !isWildcard(candidate)) ?? own.find((candidate) => !isWildcard(candidate)) ?? own[0];
		use(base, '');
		void focusInput();
	}

	function settle() {
		if (typed || !identity || isWildcard(identity)) return;
		composition.from = null;
	}
</script>

<ComposeField label="From" note={mayBeRefused ? 'Your mail server may not let you send as this address' : undefined}>
	{#if typing}
		<input bind:this={input} bind:value={composition.from} class="address" {placeholder} aria-label="Address to send from" spellcheck="false" autocomplete="off" onblur={settle} />
	{/if}
	{#if choices > 1}
		<MenuButton label="Send from" class={['sender', typing && 'compact']} align="start" minWidth={280}>
			{#snippet trigger()}
				{#if !typing}{@render current()}{/if}
				<ChevronDown size={14} class="flex-none text-[var(--text-muted)]" />
			{/snippet}
			{#snippet children(close)}
				{#each groups as group, index (group.account.id)}
					{#if index > 0}<MenuSeparator />{/if}
					{#if groups.length > 1}
						<p class="truncate px-2.5 pt-1 pb-1 text-[12px] text-[var(--text-muted)]">{group.account.name || group.account.email}</p>
					{/if}
					{#each group.identities as candidate (candidate.id)}
						{@const chosen = candidate.id === composition.identity && (!typing || isWildcard(candidate))}
						<MenuItem checked={chosen} onclick={() => (close(), choose(candidate))}>
							<span class="min-w-0 flex-1 truncate">{describe(candidate)}</span>
							{#if candidate.name && candidate.name !== group.account.name}<span class="max-w-[40%] truncate text-[12px] text-[var(--text-muted)]">{candidate.name}</span>{/if}
							{#if chosen}<Check size={15} class="flex-none" />{/if}
						</MenuItem>
					{/each}
					{#if group.account.customFrom}
						{@const chosen = typing && group.account.id === composition.account && !!identity && !isWildcard(identity)}
						<MenuItem checked={chosen} onclick={() => (close(), another(group.account))}>
							<span class="flex-1">Another address…</span>
							{#if chosen}<Check size={15} class="flex-none" />{/if}
						</MenuItem>
					{/if}
				{/each}
			{/snippet}
		</MenuButton>
	{:else if !typing}
		<span class="sender static">{@render current()}</span>
	{/if}
</ComposeField>

{#snippet current()}
	{#if identity}
		<span class="min-w-0 truncate">
			{#if identity.name}<span class="text-[var(--text)]">{identity.name}</span>{/if}
			<span class="text-[var(--text-muted)]">{describe(identity)}</span>
		</span>
	{/if}
{/snippet}

<style>
	.address {
		height: 40px;
		min-width: 0;
		flex: 1;
		background: transparent;
		font-size: 13.5px;
		outline: none;
	}

	.address::placeholder {
		color: var(--text-muted);
	}

	:global(.sender) {
		display: flex;
		min-width: 0;
		min-height: 30px;
		align-items: center;
		gap: 6px;
		margin-left: -8px;
		border-radius: var(--radius-pill);
		padding-inline: 8px;
		font-size: 13.5px;
	}

	:global(button.sender:hover) {
		background: var(--surface-hover);
	}

	:global(.sender.compact) {
		margin-left: 0;
		flex: none;
	}

	.static {
		margin-left: 0;
		padding-inline: 0;
	}
</style>
