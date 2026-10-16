<script lang="ts">
	import { bytes, plural, Row, TextField } from '@luft/ui';
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
		if (account.standing.kind === 'signInAgain') return 'Sign in again to keep using it';
		if (!drive) return '';
		if (drive.paused === 'metered') return 'Syncing paused on a metered connection';
		if (drive.paused === 'battery') return 'Syncing paused while the battery is low';
		switch (drive.state) {
			case 'connecting':
				return 'Connecting…';
			case 'offline':
				return drive.kept.length ? 'Offline, kept files are still here' : 'Offline';
			case 'problem':
				return drive.problem ?? 'Not connected';
			default:
				return drive.syncing ? `Syncing ${plural(drive.syncing, 'change')}` : '';
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
				<TextField bind:value={name} label="Name" showLabel onkeydown={(event) => event.key === 'Enter' && void saveName()} />
				<dl class="details">
					<dt>Folder</dt>
					<dd>{folder}</dd>
					{#if account.server}
						<dt>Server</dt>
						<dd>{account.server}</dd>
					{/if}
					{#if drive?.usage}
						<dt>Storage</dt>
						<dd>{bytes(drive.usage.used)} of {bytes(drive.usage.total)} used</dd>
					{/if}
					<dt>On this device</dt>
					<dd>{drive?.kept.length ? `${plural(drive.kept.length, 'item')} kept, the rest downloads when opened` : 'Files download when you open them'}</dd>
				</dl>
				{#if problem}
					<p class="text-[12.5px] text-[var(--danger)]">{problem}</p>
				{/if}
				<div class="flex flex-wrap items-center gap-2">
					{#if signInAgain}
						<button type="button" class="button primary" onclick={onsigninagain}>Sign in again</button>
					{/if}
					<span class="flex-1"></span>
					{#if confirming}
						<button type="button" class="button" onclick={() => (confirming = false)}>Keep</button>
						<button type="button" class="button danger" disabled={removing} onclick={forget}>
							{removing ? 'Removing…' : 'Remove from this computer'}
						</button>
					{:else}
						<button type="button" class="button danger" onclick={() => (confirming = true)}>Remove</button>
					{/if}
				</div>
				{#if confirming}
					<p class="-mt-2 text-right text-[12.5px] text-[var(--text-muted)]">Your files stay in {info.name}. Changes made here are sent up first.</p>
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
