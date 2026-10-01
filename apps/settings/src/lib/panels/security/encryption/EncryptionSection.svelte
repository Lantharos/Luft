<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { problem, removeTpmUnlock, replaceRecoveryKey, restart, setUpTpmUnlock, showRecoveryKey, type Trust } from '../api';
	import RecoveryKeyDialog from '../keys/RecoveryKeyDialog.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { diskStatus } from './describe';
	import TpmDialog, { type TpmMode } from './TpmDialog.svelte';
	import TurnOffDialog from './TurnOffDialog.svelte';
	import TurnOnDialog from './TurnOnDialog.svelte';
	import { withUnlock } from './unlock.svelte';

	type Open =
		| { kind: 'on' | 'off' | 'removeTpm' | 'removePin' | 'replaceKey' }
		| { kind: 'tpm'; mode: TpmMode }
		| { kind: 'key'; key: string; fresh: boolean; description?: string };

	let { trust }: { trust: Trust } = $props();

	let open = $state<Open | null>(null);
	let busy = $state(false);
	let error = $state('');

	let disk = $derived(trust.disk);
	let working = $derived(disk.state === 'encrypting' || disk.state === 'decrypting');
	let protecting = $derived(disk.encrypted && disk.state !== 'decrypting');
	let tpmUnlocks = $derived(disk.unlock.includes('tpm'));
	let pinSet = $derived(disk.unlock.includes('pin'));

	async function attempt(action: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}

	const close = () => (open = null);

	function closeTpm(recoveryKey?: string) {
		open = recoveryKey
			? { kind: 'key', key: recoveryKey, fresh: true, description: 'Your disk didn’t have a recovery key yet. Keep this one somewhere other than this computer, such as on paper or in a password manager.' }
			: null;
	}

	function relink() {
		if (pinSet) open = { kind: 'tpm', mode: 'relink' };
		else void attempt(() => withUnlock(setUpTpmUnlock('')).then((outcome) => outcome?.done && closeTpm(outcome.done)));
	}

	const showKey = () => attempt(async () => (open = { kind: 'key', key: await showRecoveryKey(), fresh: false }));

	async function replaceKey() {
		const outcome = await withUnlock(replaceRecoveryKey);
		if (outcome) open = { kind: 'key', key: outcome.done, fresh: true };
		return false;
	}
</script>

{#snippet progress()}
	<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
		<div class="bar h-full rounded-full bg-[var(--accent)]" style:width="{disk.progress * 100}%"></div>
	</div>
{/snippet}

<Section title="Device encryption">
	<Row
		title="Device encryption"
		description={diskStatus(disk)}
		below={working ? progress : undefined}
	>
		{#if disk.state === 'starting'}
			<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>Restart</button>
		{:else}
			<Switch
				label="Device encryption"
				checked={protecting}
				disabled={working}
				onchange={(on) => (open = { kind: on ? 'on' : 'off' })}
			/>
		{/if}
	</Row>

	{#if disk.tpmRefused && tpmUnlocks}
		<Row
			title="Your computer asked for the recovery key at the last startup"
			description="This can happen after a firmware update or a change to how the computer starts. Link the TPM again so the disk unlocks by itself next time."
		>
			<button type="button" class="button" disabled={busy} onclick={relink}>Link the TPM again</button>
		</Row>
	{/if}

	{#if protecting}
		{#if tpmUnlocks}
			<Row title="Unlock with the TPM" description="The disk unlocks without a passphrase as long as nothing has changed how the computer starts">
				<Switch label="Unlock with the TPM" checked disabled={busy} onchange={() => (open = { kind: 'removeTpm' })} />
			</Row>
			<Row title="PIN at startup" description={pinSet ? 'You type it before the disk unlocks' : 'Keeps the disk locked until you type it, even if someone takes the whole computer'}>
				{#if pinSet}
					<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'change' })}>Change</button>
					<button type="button" class="button" onclick={() => (open = { kind: 'removePin' })}>Remove</button>
				{:else}
					<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'add' })}>Add PIN</button>
				{/if}
			</Row>
		{:else if trust.tpm.usable}
			<Row title="Unlock with the TPM" description="Lets the disk unlock by itself instead of asking for a passphrase when the computer starts">
				<Switch label="Unlock with the TPM" checked={false} onchange={() => (open = { kind: 'tpm', mode: 'setup' })} />
			</Row>
		{/if}
		<Row title="Recovery key" description="Gets you back in if the disk can’t unlock by itself">
			{#if disk.recoveryKeyStored}
				<button type="button" class="button" disabled={busy} onclick={showKey}>Show</button>
			{/if}
			<button type="button" class="button" disabled={busy} onclick={() => (open = { kind: 'replaceKey' })}>Replace</button>
		</Row>
	{/if}
</Section>

{#if error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
{/if}

{#if open?.kind === 'on'}
	<TurnOnDialog tpm={trust.tpm} onclose={close} />
{:else if open?.kind === 'off'}
	<TurnOffDialog onclose={close} />
{:else if open?.kind === 'tpm'}
	<TpmDialog mode={open.mode} onclose={closeTpm} />
{:else if open?.kind === 'removeTpm'}
	<ConfirmDialog
		title="Stop unlocking with the TPM?"
		description={disk.unlock.includes('passphrase')
			? 'Your computer will ask for your passphrase every time it starts.'
			: 'Your computer will ask for your recovery key every time it starts, so keep it close.'}
		action="Stop using the TPM"
		danger
		run={async () => Boolean(await withUnlock(removeTpmUnlock))}
		onclose={close}
	/>
{:else if open?.kind === 'removePin'}
	<ConfirmDialog
		title="Remove your PIN?"
		description="The disk will unlock by itself again when the computer starts."
		action="Remove PIN"
		run={async () => Boolean(await withUnlock(setUpTpmUnlock('')))}
		onclose={close}
	/>
{:else if open?.kind === 'replaceKey'}
	<ConfirmDialog
		title="Replace your recovery key?"
		description="Your current key stops working, and you’ll get a new one to save."
		action="Replace key"
		run={replaceKey}
		onclose={close}
	/>
{:else if open?.kind === 'key'}
	<RecoveryKeyDialog key={open.key} fresh={open.fresh} description={open.description} onclose={close} />
{/if}

<style>
	.bar {
		transition: width 240ms var(--ease);
	}
</style>
