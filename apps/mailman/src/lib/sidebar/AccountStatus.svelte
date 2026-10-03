<script lang="ts">
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { tooltip } from '@luft/ui';
	import * as api from '#lib/api/index.js';
	import { mail } from '#lib/mail/mail.svelte.js';

	let failing = $derived(Object.values(mail.status).filter((status) => status.state === 'error'));
	let syncing = $derived(Object.values(mail.status).some((status) => status.state === 'syncing'));
</script>

{#if failing.length || syncing}
	<div class="status">
		{#if failing.length}
			<CloudOff size={15} class="flex-none text-[var(--danger)]" />
			<span class="min-w-0 flex-1 truncate" {@attach tooltip(failing[0].message ?? '')}>
				{mail.account(failing[0].account)?.email ?? 'An account'} can't sync
			</span>
			<button type="button" class="icon-button retry" aria-label="Try again" onclick={() => void api.syncNow()}>
				<RefreshCw size={14} />
			</button>
		{:else}
			<RefreshCw size={14} class="spin flex-none" />
			<span class="min-w-0 flex-1 truncate">Checking for mail</span>
		{/if}
	</div>
{/if}

<style>
	.status {
		display: flex;
		height: 44px;
		flex: none;
		align-items: center;
		gap: 10px;
		margin: 0 12px 8px;
		padding-inline: 12px 4px;
		font-size: 12.5px;
		color: var(--sidebar-text-muted);
	}

	.retry {
		height: 28px;
		width: 28px;
	}

	:global(.spin) {
		animation: spin 1.2s linear infinite;
	}

	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
</style>
