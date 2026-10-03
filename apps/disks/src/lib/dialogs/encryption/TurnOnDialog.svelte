<script lang="ts">
	import { untrack } from 'svelte';
	import { Checkbox, Dialog, PasswordField, RecoveryKey } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Drive, EncryptionCheck, Volume } from '$lib/api';
	import { SHORTEST_PASSPHRASE } from '$lib/encryption.svelte';
	import { errorText, volumeName } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import Steps from './Steps.svelte';
	import SwitchLine from './SwitchLine.svelte';

	interface Props {
		drive: Drive;
		volume: Volume;
		onclose: () => void;
	}

	let { drive, volume, onclose }: Props = $props();

	type Step = 'check' | 'key' | 'unlock' | 'summary';
	const STEPS: Step[] = ['check', 'key', 'unlock', 'summary'];
	const EXT4_LABEL = 16;

	let step = $state<Step>('check');
	let check = $state.raw<EncryptionCheck | null>(null);
	let key = $state('');
	let saved = $state(false);
	let auto = $state(false);
	let usePassphrase = $state(untrack(() => drive.removable));
	let passphrase = $state('');
	let confirmation = $state('');
	let busy = $state(false);
	let error = $state('');

	let name = $derived(volumeName(volume));
	let reformat = $derived(check?.method === 'reformat');
	let blocked = $derived(check?.method === 'none' || (check?.method === 'in-place' && check.checks.some((item) => !item.passed)));
	let autoAvailable = $derived(check !== null && !check.autoUnlock);
	let passphraseReady = $derived(passphrase.length >= SHORTEST_PASSPHRASE && passphrase === confirmation);
	let unlockReady = $derived(usePassphrase ? passphraseReady : auto);
	let mismatch = $derived(confirmation.length > 0 && passphrase !== confirmation);

	let titles = $derived<Record<Step, string>>({
		check: blocked ? `“${name}” can’t be encrypted` : reformat ? `“${name}” can only be encrypted by formatting it` : `Encrypt “${name}”`,
		key: 'Save the recovery key',
		unlock: 'How it unlocks',
		summary: reformat ? 'Ready to erase and encrypt' : 'Ready to encrypt'
	});

	let descriptions = $derived<Record<Step, string>>({
		check: blocked
			? 'Take care of what’s marked below, then try again.'
			: reformat
				? 'It’s formatted as ext4 with encryption, which erases everything on it. Copy anything you want to keep somewhere else first.'
				: 'Nobody can read what’s on it without its key, even if the drive is lost or taken out of the computer. Your files stay where they are.',
		key: 'If it ever won’t unlock any other way, this key opens it. Keep it somewhere other than the drive and this computer.',
		unlock: drive.removable
			? 'A passphrase opens it on any Linux computer. On this one, it can also unlock by itself.'
			: 'It can unlock by itself whenever this computer starts, or ask for a passphrase.',
		summary: 'Here’s what happens next.'
	});

	let summary = $derived(
		reformat
			? [
					`Everything on “${name}” is erased.`,
					`It’s formatted as ext4 and encrypted. Linux computers can open it with its ${usePassphrase ? 'passphrase or ' : ''}recovery key.`,
					auto ? (drive.removable ? 'It unlocks by itself when you plug it into this computer.' : 'It unlocks by itself when this computer starts.') : ''
				]
			: [
					'It’s unavailable for a few seconds while encrypting starts.',
					'The rest happens in the background, and you can keep using it.',
					usePassphrase ? 'Its passphrase works once encrypting is done. Until then, use the recovery key.' : '',
					`Keep the computer plugged in${drive.removable ? ' and the drive connected' : ''}. If anything interrupts it, it continues where it stopped.`
				]
	);

	async function attempt<T>(action: () => Promise<T>) {
		busy = true;
		error = '';
		try {
			return await action();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== api.CANCELLED) error = message;
			return undefined;
		} finally {
			busy = false;
		}
	}

	void attempt(() => api.trust.check(volume.block)).then((result) => {
		check = result ?? null;
		auto = Boolean(result && !result.autoUnlock && !drive.removable);
	});

	async function next() {
		if (step === 'check' && !key) key = (await attempt(api.trust.recoveryKey)) ?? '';
		if (step === 'check' && !key) return;
		step = STEPS[STEPS.indexOf(step) + 1];
	}

	const back = () => (step = STEPS[STEPS.indexOf(step) - 1]);

	async function encrypt() {
		const secret = usePassphrase ? passphrase : '';
		const done = await attempt(async () => {
			if (reformat) {
				const label = (volume.label || name).slice(0, EXT4_LABEL);
				await api.trust.format(volume.block, { filesystem: 'ext4', label, passphrase: secret || null, remember: false, erase: false }, key, auto);
			} else {
				await api.trust.encrypt(volume.block, key, secret, auto);
			}
			return true;
		});
		if (done) onclose();
	}
</script>

<Dialog title={titles[step]} description={descriptions[step]} wide onclose={() => !busy && onclose()}>
	{#if step === 'check'}
		{#if check}
			<Steps items={check.checks} />
		{:else if !error}
			<p class="px-1 text-[13px] text-[var(--text-muted)]">Checking the drive…</p>
		{/if}
	{:else if step === 'key'}
		<RecoveryKey {key} onsave={() => api.trust.saveKey(key, name)} onprint={() => api.trust.printKey(key, name)} />
		<Checkbox label="I’ve saved the recovery key" checked={saved} onchange={(checked) => (saved = checked)}>I’ve saved the recovery key</Checkbox>
	{:else if step === 'unlock'}
		<SwitchLine
			title="Unlock automatically on this computer"
			description={autoAvailable ? (drive.removable ? 'When you plug it in, it opens without asking.' : 'When this computer starts, it opens without asking.') : (check?.autoUnlock ?? '')}
			checked={auto && autoAvailable}
			disabled={!autoAvailable}
			onchange={(checked) => (auto = checked)}
		/>
		<SwitchLine
			title="Use a passphrase"
			description={drive.removable ? 'To open it on other computers.' : 'Asked for when it doesn’t unlock by itself.'}
			checked={usePassphrase}
			onchange={(checked) => (usePassphrase = checked)}
		/>
		{#if usePassphrase}
			<PasswordField label="Passphrase" bind:value={passphrase} autocomplete="new-password" error={passphrase && passphrase.length < SHORTEST_PASSPHRASE ? `At least ${SHORTEST_PASSPHRASE} characters` : ''} />
			<PasswordField label="Confirm passphrase" bind:value={confirmation} autocomplete="new-password" error={mismatch ? 'The passphrases don’t match' : ''} live />
		{/if}
		{#if !usePassphrase && !auto}
			<p class="px-1 text-[12.5px] text-[var(--text-muted)]">Choose at least one, so you don’t need the recovery key every time.</p>
		{/if}
	{:else}
		<ol class="flex flex-col gap-2.5 px-1">
			{#each summary.filter(Boolean) as sentence, index (sentence)}
				<li class="flex gap-3 text-[13px] leading-relaxed text-[var(--text-soft)]">
					<span class="w-4 flex-none text-right text-[var(--text-muted)] tabular-nums">{index + 1}</span>
					<span>{sentence}</span>
				</li>
			{/each}
		</ol>
	{/if}
	{#if error}
		<p class="px-1 text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if step === 'check'}
			<button type="button" class="button" disabled={busy} onclick={onclose}>{blocked ? 'Close' : 'Cancel'}</button>
			{#if !blocked}
				<button type="button" class="button primary" disabled={busy || !check} onclick={next}>Continue</button>
			{/if}
		{:else}
			<button type="button" class="button" disabled={busy} onclick={back}>Back</button>
			{#if step === 'summary'}
				<button type="button" class={['button', reformat ? 'danger' : 'primary']} disabled={busy} onclick={encrypt}>
					{busy ? 'Starting…' : reformat ? 'Erase and encrypt' : 'Encrypt'}
				</button>
			{:else}
				<button type="button" class="button primary" disabled={(step === 'key' && !saved) || (step === 'unlock' && !unlockReady)} onclick={next}>Continue</button>
			{/if}
		{/if}
	{/snippet}
</Dialog>
