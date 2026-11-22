<script lang="ts">
	import CloudOff from '@luft/symbols/icons/cloud-off';
	import RefreshCw from '@luft/symbols/icons/refresh-cw';
	import { t } from '@luft/i18n';
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
	let failure = $derived(failed ? (account ? t('mailman-status-cant-sync', { email: account.email }) : t('mailman-status-cant-sync-account')) : '');
	let reason = $derived(failed?.message ?? '');
	let signIn = $derived(failed?.signedOut && account ? () => onsignin(account) : null);
</script>

{#if failed && rail}
	<button type="button" class="icon-button large mx-auto mb-3 text-[var(--danger)]" aria-label={signIn ? t('mailman-status-sign-in-again', { failure }) : t('mailman-status-try-again-label', { failure })} onclick={signIn ?? mail.checkNow} {@attach tooltip(t('mailman-status-failure', { failure, reason }))}>
		<CloudOff size={17} />
	</button>
{:else if mail.checking && rail}
	<span class="mx-auto mb-3 grid h-10 w-10 place-items-center text-[var(--sidebar-text-muted)]" {@attach tooltip(t('mailman-status-checking'))}>
		<RefreshCw size={15} class="animate-spin" />
	</span>
{:else if failed}
	<div class="status failed">
		<div class="flex items-center gap-2.5">
			<CloudOff size={15} class="flex-none text-[var(--danger)]" />
			<p class="min-w-0 flex-1 truncate font-medium text-[var(--sidebar-text)]">{signIn ? t('mailman-status-signed-out') : t('mailman-status-failed')}</p>
			{#if signIn}
				<button type="button" class="button flex-none" onclick={signIn}>{t('mailman-status-sign-in')}</button>
			{:else}
				<button type="button" class="icon-button retry" aria-label={t('mailman-status-try-again')} onclick={mail.checkNow}>
					<RefreshCw size={14} />
				</button>
			{/if}
		</div>
		<p class="truncate pl-[25px]">{account?.email}</p>
		<p class="line-clamp-2 pl-[25px]" {@attach tooltip(reason)}>{reason}</p>
	</div>
{:else if mail.checking}
	<div class="status">
		<RefreshCw size={14} class="flex-none animate-spin" />
		<span class="min-w-0 flex-1 truncate">{t('mailman-status-checking')}</span>
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
