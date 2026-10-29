<script lang="ts">
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { tooltip } from '@luft/ui';
	import type { Account } from '#lib/bindings.js';
	import { mail } from '#lib/mail/mail.svelte.js';

	interface Props {
		rail: boolean;
		onsignin: (account: Account) => void;
	}

	let { rail, onsignin }: Props = $props();

	let failed = $derived(Object.values(mail.status).find((status) => status.state === 'error'));
	let account = $derived(failed && mail.account(failed.account));
	let failure = $derived(failed ? `${account?.email ?? 'An account'} can't sync` : '');
	let reason = $derived(failed?.message ?? '');
	let signIn = $derived(failed?.signedOut && account ? () => onsignin(account) : null);
</script>

{#if failed && rail}
	<button type="button" class="icon-button large mx-auto mb-3 text-[var(--danger)]" aria-label={signIn ? `${failure}, sign in again` : `${failure}, try again`} onclick={signIn ?? mail.checkNow} {@attach tooltip(`${failure}: ${reason}`)}>
		<CloudOff size={17} />
	</button>
{:else if mail.syncing && rail}
	<span class="mx-auto mb-3 grid h-10 w-10 place-items-center text-[var(--sidebar-text-muted)]" {@attach tooltip('Checking for mail')}>
		<RefreshCw size={15} class="animate-spin" />
	</span>
{:else if failed}
	<div class="status failed">
		<div class="flex items-center gap-2.5">
			<CloudOff size={15} class="flex-none text-[var(--danger)]" />
			<p class="min-w-0 flex-1 truncate font-medium text-[var(--sidebar-text)]">{signIn ? 'Signed out' : "Can't sync"}</p>
			{#if signIn}
				<button type="button" class="button flex-none" onclick={signIn}>Sign in</button>
			{:else}
				<button type="button" class="icon-button retry" aria-label="Try again" onclick={mail.checkNow}>
					<RefreshCw size={14} />
				</button>
			{/if}
		</div>
		<p class="truncate pl-[25px]">{account?.email}</p>
		<p class="line-clamp-2 pl-[25px]" {@attach tooltip(reason)}>{reason}</p>
	</div>
{:else if mail.syncing}
	<div class="status">
		<RefreshCw size={14} class="flex-none animate-spin" />
		<span class="min-w-0 flex-1 truncate">Checking for mail</span>
	</div>
{/if}

<style>
	.status {
		display: flex;
		min-height: 44px;
		flex: none;
		align-items: center;
		gap: 10px;
		margin: 0 12px 8px;
		padding-inline: 12px 4px;
		font-size: 12.5px;
		line-height: 1.35;
		color: var(--sidebar-text-muted);
	}

	.failed {
		flex-direction: column;
		align-items: stretch;
		gap: 2px;
		padding-block: 8px;
	}

	.retry {
		height: 28px;
		width: 28px;
	}
</style>
