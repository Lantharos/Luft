<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import { Checkbox, Dialog, Switch } from '@luft/ui';
	import { MINIMUM_LENGTH } from '$lib/panels/users/strength';
	import { checkEncryption, generateRecoveryKey, problem, restart, turnOnEncryption, type Check, type Tpm } from '../api';
	import PassphraseFields from '../keys/PassphraseFields.svelte';
	import PinFields from '../keys/PinFields.svelte';
	import { pinReady } from '../keys/pin';
	import RecoveryKeyView from '../keys/RecoveryKeyView.svelte';

	type Step = 'check' | 'key' | 'unlock' | 'summary';

	let { tpm, onclose }: { tpm: Tpm; onclose: () => void } = $props();

	const STEPS: Step[] = ['check', 'key', 'unlock', 'summary'];
	const WHAT_HAPPENS = [
		'Your computer restarts once.',
		'While it starts, a short “Encrypting your device” screen appears.',
		'The rest happens in the background while you keep working.',
		'Keep the computer plugged in until it’s done.'
	];

	let step = $state<Step>('check');
	let checks = $state<Check[] | null>(null);
	let key = $state('');
	let saved = $state(false);
	let usePin = $state(false);
	let pin = $state('');
	let pinConfirmation = $state('');
	let passphrase = $state('');
	let passphraseConfirmation = $state('');
	let busy = $state(false);
	let error = $state('');

	let blocked = $derived(checks?.some((check) => !check.passed) ?? false);
	let unlockReady = $derived(
		tpm.usable ? !usePin || pinReady(pin, pinConfirmation) : passphrase.length >= MINIMUM_LENGTH && passphrase === passphraseConfirmation
	);

	async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
		busy = true;
		error = '';
		try {
			return await action();
		} catch (reason) {
			error = problem(reason);
		} finally {
			busy = false;
		}
	}

	async function next() {
		if (step === 'check' && !key) key = (await run(generateRecoveryKey)) ?? '';
		if (step === 'check' && !key) return;
		step = STEPS[STEPS.indexOf(step) + 1];
	}

	const back = () => (step = STEPS[STEPS.indexOf(step) - 1]);

	async function encrypt() {
		const started = await run(async () => {
			await turnOnEncryption(key, tpm.usable && usePin ? pin : '', tpm.usable ? '' : passphrase);
			return true;
		});
		if (!started) return;
		await run(restart);
		if (!error) onclose();
	}

	run(checkEncryption).then((results) => (checks = results ?? null));

	const titles: Record<Step, string> = $derived({
		check: blocked ? 'Device encryption can’t be turned on yet' : 'Turn on device encryption',
		key: 'Save your recovery key',
		unlock: tpm.usable ? 'Unlocking when the computer starts' : 'Choose a passphrase',
		summary: 'Ready to encrypt'
	});

	const descriptions: Record<Step, string> = $derived({
		check: blocked
			? 'Take care of what’s marked below, then try again.'
			: 'Encryption keeps your files private if this computer is lost or stolen. Without the right key, nobody can read the disk.',
		key: 'If the disk ever can’t unlock by itself, for example after a hardware repair, this key is the way back in. Keep it somewhere other than this computer.',
		unlock: tpm.usable
			? 'The TPM, a security chip in your computer, unlocks the disk by itself when the computer starts, so signing in stays the same.'
			: 'This computer doesn’t have a TPM that can unlock the disk by itself, so it asks for this passphrase every time it starts.',
		summary: 'Here’s what happens next.'
	});
</script>

<Dialog title={titles[step]} description={descriptions[step]} wide onclose={() => !busy && onclose()}>
	{#if step === 'check'}
		{#if checks}
			<ul class="flex flex-col gap-2.5">
				{#each checks as check (check.id)}
					<li class="flex items-start gap-3 text-[13px] leading-relaxed">
						<span class="mt-0.5 flex-none">
							{#if check.passed}
								<CircleCheck size={16} class="text-[var(--success)]" />
							{:else}
								<CircleAlert size={16} class="text-[var(--danger)]" />
							{/if}
						</span>
						<span class={check.passed ? 'text-[var(--text-soft)]' : 'text-[var(--text)]'}>{check.sentence}</span>
					</li>
				{/each}
			</ul>
			{#if !blocked}
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">Before you start, make sure your important files are backed up.</p>
			{/if}
		{:else if !error}
			<p class="text-[13px] text-[var(--text-muted)]">Checking your computer…</p>
		{/if}
	{:else if step === 'key'}
		<RecoveryKeyView {key} />
		<Checkbox label="I’ve saved my recovery key" checked={saved} onchange={(checked) => (saved = checked)}>I’ve saved my recovery key</Checkbox>
	{:else if step === 'unlock'}
		{#if tpm.usable}
			<div class="flex items-center gap-4 px-1">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="text-[14px] font-medium">Also ask for a PIN</span>
					<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">Adds a step when the computer starts, and keeps the disk locked even if someone takes the whole computer.</span>
				</div>
				<Switch label="Also ask for a PIN" checked={usePin} onchange={(on) => (usePin = on)} />
			</div>
			{#if usePin}
				<PinFields bind:pin bind:confirmation={pinConfirmation} onsubmit={() => unlockReady && next()} />
			{/if}
		{:else}
			<PassphraseFields bind:passphrase bind:confirmation={passphraseConfirmation} onsubmit={() => unlockReady && next()} />
		{/if}
	{:else}
		<ol class="flex flex-col gap-2.5">
			{#each WHAT_HAPPENS as sentence, index (sentence)}
				<li class="flex gap-3 text-[13px] leading-relaxed text-[var(--text-soft)]">
					<span class="w-4 flex-none text-right text-[var(--text-muted)] tabular-nums">{index + 1}</span>
					<span>{sentence}</span>
				</li>
			{/each}
		</ol>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if step === 'check'}
			<button type="button" class="button" disabled={busy} onclick={onclose}>{blocked ? 'Close' : 'Cancel'}</button>
			{#if !blocked}
				<button type="button" class="button primary" disabled={busy || !checks} onclick={next}>Continue</button>
			{/if}
		{:else}
			<button type="button" class="button" disabled={busy} onclick={back}>Back</button>
			{#if step === 'summary'}
				<button type="button" class="button primary" disabled={busy} onclick={encrypt}>{busy ? 'Starting…' : 'Restart and encrypt'}</button>
			{:else}
				<button type="button" class="button primary" disabled={(step === 'key' && !saved) || (step === 'unlock' && !unlockReady)} onclick={next}>Continue</button>
			{/if}
		{/if}
	{/snippet}
</Dialog>
