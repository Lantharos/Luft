<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { problem, removeTpmUnlock, replaceRecoveryKey, setUpTpmUnlock, showRecoveryKey, type Trust } from '../api';
	import RecoveryKeyDialog from '../keys/RecoveryKeyDialog.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import TpmDialog, { type TpmMode } from './TpmDialog.svelte';
	import { withUnlock } from './unlock.svelte';

	type Open = { kind: 'removeTpm' | 'removePin' | 'replaceKey' } | { kind: 'tpm'; mode: TpmMode } | { kind: 'key'; key: string; fresh: boolean; description?: string };

	let { trust }: { trust: Trust } = $props();

	let open = $state<Open | null>(null);
	let busy = $state(false);
	let error = $state('');

	let disk = $derived(trust.disk);
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
			? { kind: 'key', key: recoveryKey, fresh: true, description: 'Your disk didn’t have a recovery key yet. Keep this one somewhere other than this computer.' }
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

<Section title="Unlocking your disk">
	{#if disk.tpmRefused && tpmUnlocks}
		<Row title="Your disk asked for its recovery key" description="Link the security chip again so it unlocks by itself">
			<button type="button" class="button" disabled={busy} onclick={relink}>Link again</button>
		</Row>
	{/if}

	{#if tpmUnlocks}
		<Row title="Unlock with the security chip" description="As long as nothing changes how this computer starts">
			<Switch label="Unlock with the security chip" checked disabled={busy} onchange={() => (open = { kind: 'removeTpm' })} />
		</Row>
		{#if pinSet}
			<Row title="PIN at startup" description="You type it before the disk unlocks">
				<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'change' })}>Change</button>
				<button type="button" class="button" onclick={() => (open = { kind: 'removePin' })}>Remove</button>
			</Row>
		{:else}
			<Row title="Add a PIN at startup" description="Keeps the disk locked even if the computer is taken">
				<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'add' })}>Add PIN</button>
			</Row>
		{/if}
	{:else if trust.tpm.usable}
		<Row title="Unlock with the security chip" description="So you don’t type a passphrase at startup">
			<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'setup' })}>Set up</button>
		</Row>
	{/if}

	<Row title="Recovery key" description="Gets you in if the disk can’t unlock by itself">
		{#if disk.recoveryKeyStored}
			<button type="button" class="button" disabled={busy} onclick={showKey}>Show</button>
		{/if}
		<button type="button" class="button" disabled={busy} onclick={() => (open = { kind: 'replaceKey' })}>Replace</button>
	</Row>
</Section>

{#if error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
{/if}

{#if open?.kind === 'tpm'}
	<TpmDialog mode={open.mode} onclose={closeTpm} />
{:else if open?.kind === 'removeTpm'}
	<ConfirmDialog
		title="Stop unlocking with the security chip?"
		description={disk.unlock.includes('passphrase')
			? 'Your computer will ask for your passphrase every time it starts.'
			: 'Your computer will ask for your recovery key every time it starts, so keep it close.'}
		action="Stop unlocking"
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
