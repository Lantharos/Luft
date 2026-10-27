<script lang="ts">
	import { untrack } from 'svelte';
	import { EncryptionWizard, errorText, PassphraseFields } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, DriveCheck, Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { SHORTEST_PASSPHRASE } from '#lib/encryption.svelte.js';
	import { volumeName } from '#lib/format.js';
	import SwitchLine from './SwitchLine.svelte';

	interface Props {
		drive: Drive;
		volume: Volume;
		onclose: () => void;
	}

	let { drive, volume, onclose }: Props = $props();

	const EXT4_LABEL = 16;

	let plan = $state.raw<DriveCheck | null>(null);
	let auto = $state(false);
	let usePassphrase = $state(untrack(() => drive.removable));
	let passphrase = $state('');
	let confirmation = $state('');

	let name = $derived(volumeName(volume));
	let reformat = $derived(plan?.method === 'reformat');
	let blocked = $derived(plan?.method === 'none' || (plan?.method === 'in-place' && plan.checks.some((item) => !item.passed)));
	let autoAvailable = $derived(plan !== null && !plan.autoUnlock);
	let passphraseReady = $derived(passphrase.length >= SHORTEST_PASSPHRASE && passphrase === confirmation);
	let unlockReady = $derived(usePassphrase ? passphraseReady : auto);

	let titles = $derived({
		check: blocked ? `“${name}” can’t be encrypted` : reformat ? `“${name}” can only be encrypted by formatting it` : `Encrypt “${name}”`,
		key: 'Save the recovery key',
		unlock: 'How it unlocks',
		summary: reformat ? 'Ready to erase and encrypt' : 'Ready to encrypt'
	});

	let descriptions = $derived({
		check: blocked ? undefined : reformat ? 'This erases everything on it. Copy anything you want to keep first.' : 'Your files stay where they are.',
		key: 'Keep it somewhere other than this drive and computer.'
	});

	let summary = $derived(
		(reformat
			? [
					`Everything on “${name}” is erased.`,
					'It’s formatted as ext4 and encrypted.',
					auto ? (drive.removable ? 'It unlocks by itself when you plug it in here.' : 'It unlocks by itself when this computer starts.') : ''
				]
			: [
					'It’s unavailable for a few seconds, then encrypts in the background while you use it.',
					usePassphrase ? 'Until it’s done, it opens with the recovery key instead of the passphrase.' : '',
					`Keep the computer plugged in${drive.removable ? ' and the drive connected' : ''}. An interruption only pauses it.`
				]
		).filter(Boolean)
	);

	async function check() {
		plan = await commands.trustCheck({ block: volume.block }, WAIT);
		auto = !plan.autoUnlock && !drive.removable;
		return plan.checks;
	}

	async function encrypt(key: string) {
		const secret = usePassphrase ? passphrase : '';
		if (!reformat) {
			await commands.trustEncrypt({ block: volume.block, recoveryKey: key, passphrase: secret, autoUnlock: auto }, WAIT);
			return;
		}
		const label = (volume.label || name).slice(0, EXT4_LABEL);
		await commands.trustFormat({ block: volume.block, format: { filesystem: 'ext4', label, passphrase: secret || null, remember: false, erase: false }, recoveryKey: key, autoUnlock: auto }, WAIT);
	}

	function explain(caught: unknown) {
		const message = errorText(caught);
		return message === CANCELLED ? '' : message;
	}
</script>

<EncryptionWizard
	{titles}
	{descriptions}
	{check}
	{blocked}
	recoveryKey={commands.trustRecoveryKey}
	onsave={(key) => commands.trustSaveKey({ key, name }, WAIT)}
	onprint={(key) => commands.trustPrintKey({ key, name }, WAIT)}
	{unlockReady}
	{summary}
	finish={reformat ? 'Erase and encrypt' : 'Encrypt'}
	finishing="Starting…"
	danger={reformat}
	onfinish={encrypt}
	{explain}
	{onclose}
>
	{#snippet unlock(next)}
		<SwitchLine
			title="Unlock automatically"
			hint={drive.removable ? 'Opens without asking when you plug it in' : 'Opens without asking when this computer starts'}
			note={autoAvailable ? undefined : (plan?.autoUnlock ?? '')}
			checked={auto && autoAvailable}
			disabled={!autoAvailable}
			onchange={(checked) => (auto = checked)}
		/>
		<SwitchLine
			title="Use a passphrase"
			hint={drive.removable ? 'To open it on other computers' : 'Asked for when it doesn’t unlock by itself'}
			checked={usePassphrase}
			onchange={(checked) => (usePassphrase = checked)}
		/>
		{#if usePassphrase}
			<PassphraseFields bind:passphrase bind:confirmation minimum={SHORTEST_PASSPHRASE} onsubmit={next} />
		{:else if !auto}
			<p class="px-1 text-[12.5px] text-[var(--text-muted)]">Choose at least one.</p>
		{/if}
	{/snippet}
</EncryptionWizard>
