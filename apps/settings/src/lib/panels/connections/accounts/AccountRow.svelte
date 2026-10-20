<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row, TextField } from '@luft/ui';
	import { remove, rename, type Account, type Drive } from './api';
	import { provider } from './providers';

	interface Props {
		account: Account;
		drive: Drive | undefined;
		onsigninagain: () => void;
	}

	let { account, drive, onsigninagain }: Props = $props();

	let open = $state(false);
	let name = $derived(account.name);
	let confirming = $state(false);
	let removing = $state(false);
	let problem = $state('');

	let info = $derived(provider(account.provider));
	let signInAgain = $derived(account.standing.kind === 'signInAgain');
	let folder = $derived(drive?.path.replace(/^\/(home|var\/home)\/[^/]+/, '~') ?? `~/Cloud/${account.name}`);

	function status() {
		if (account.standing.kind === 'signInAgain') return t('settings-accounts-sign-in-again-needed');
		if (!drive) return '';
		if (drive.paused === 'metered') return t('settings-accounts-paused-metered');
		if (drive.paused === 'battery') return t('settings-accounts-paused-battery');
		switch (drive.state) {
			case 'connecting':
				return t('settings-accounts-connecting');
			case 'offline':
				return drive.kept.length ? t('settings-accounts-offline-kept') : t('settings-accounts-offline');
			case 'problem':
				return drive.problem ?? t('settings-accounts-not-connected');
			default:
				return drive.syncing ? t('settings-accounts-syncing', { count: drive.syncing }) : '';
		}
	}

	let description = $derived([account.user, status()].filter(Boolean).join(' · '));

	async function saveName() {
		const wanted = name.trim();
		if (!wanted || wanted === account.name) return;
		problem = '';
		await rename(account.id, wanted).catch((reason) => (problem = String(reason)));
	}

	function toggle() {
		if (open) void saveName();
		open = !open;
		confirming = false;
	}

	async function forget() {
		removing = true;
		problem = '';
		await remove(account.id).catch((reason) => (problem = String(reason)));
		removing = false;
	}
</script>

<Row title={account.name} {description} icon={info.icon} expanded={open} onclick={toggle} truncate>
	{#snippet below()}
		{#if open}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class="flex flex-col gap-4 pt-1" onclick={(event) => event.stopPropagation()}>
				{#if account.standing.kind === 'signInAgain'}
					<p class="text-[13px] leading-relaxed text-[var(--danger)]">{account.standing.reason}</p>
				{/if}
				<TextField bind:value={name} label={t('settings-accounts-name')} showLabel onkeydown={(event) => event.key === 'Enter' && void saveName()} />
				<dl class="details">
					<dt>{t('settings-accounts-folder')}</dt>
					<dd>{folder}</dd>
					{#if account.server}
						<dt>{t('settings-accounts-server')}</dt>
						<dd>{account.server}</dd>
					{/if}
					{#if drive?.usage}
						<dt>{t('settings-accounts-storage')}</dt>
						<dd>{t('settings-accounts-storage-used', { used: bytes(drive.usage.used), total: bytes(drive.usage.total) })}</dd>
					{/if}
					<dt>{t('settings-accounts-on-device')}</dt>
					<dd>{drive?.kept.length ? t('settings-accounts-kept', { count: drive.kept.length }) : t('settings-accounts-on-demand')}</dd>
				</dl>
				{#if problem}
					<p class="text-[12.5px] text-[var(--danger)]">{problem}</p>
				{/if}
				<div class="flex flex-wrap items-center gap-2">
					{#if signInAgain}
						<button type="button" class="button primary" onclick={onsigninagain}>{t('settings-accounts-sign-in-again')}</button>
					{/if}
					<span class="flex-1"></span>
					{#if confirming}
						<button type="button" class="button" onclick={() => (confirming = false)}>{t('settings-accounts-keep')}</button>
						<button type="button" class="button danger" disabled={removing} onclick={forget}>
							{removing ? t('settings-accounts-removing') : t('settings-accounts-remove-confirm')}
						</button>
					{:else}
						<button type="button" class="button danger" onclick={() => (confirming = true)}>{t('settings-accounts-remove')}</button>
					{/if}
				</div>
				{#if confirming}
					<p class="-mt-2 text-right text-[12.5px] text-[var(--text-muted)]">{t('settings-accounts-remove-note', { provider: info.name })}</p>
				{/if}
			</div>
		{/if}
	{/snippet}
</Row>

<style>
	.details {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 6px 16px;
		font-size: 13px;
	}

	.details dt {
		color: var(--text-muted);
	}

	.details dd {
		min-width: 0;
		overflow-wrap: anywhere;
		color: var(--text-soft);
	}
</style>
