<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import { t } from '@luft/i18n';
	import { Checkbox, Dialog, RecoveryKey, Switch } from '@luft/ui';
	import { MINIMUM_LENGTH } from '#lib/panels/system/users/strength.js';
	import { checkEncryption, generateRecoveryKey, printRecoveryKey, problem, restart, saveRecoveryKey, turnOnEncryption, type Check, type Tpm } from '../api';
	import PassphraseFields from '../keys/PassphraseFields.svelte';
	import PinFields from '../keys/PinFields.svelte';
	import { pinReady } from '../keys/pin';

	type Step = 'check' | 'key' | 'unlock' | 'summary';

	let { tpm, onclose }: { tpm: Tpm; onclose: () => void } = $props();

	const STEPS: Step[] = ['check', 'key', 'unlock', 'summary'];
	const WHAT_HAPPENS = [
		'settings-encryption-step-restart',
		'settings-encryption-step-screen',
		'settings-encryption-step-background',
		'settings-encryption-step-plugged-in'
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
		check: blocked ? 'settings-encryption-blocked-title' : 'settings-encryption-turn-on-title',
		key: 'settings-encryption-key-title',
		unlock: tpm.usable ? 'settings-encryption-unlock-title' : 'settings-encryption-passphrase-title',
		summary: 'settings-encryption-summary-title'
	});

	const descriptions: Record<Step, string> = $derived({
		check: blocked ? 'settings-encryption-blocked-description' : 'settings-encryption-turn-on-description',
		key: 'settings-encryption-key-description',
		unlock: tpm.usable ? 'settings-encryption-unlock-description' : 'settings-encryption-passphrase-description',
		summary: 'settings-encryption-summary-description'
	});
</script>

<Dialog title={t(titles[step])} description={t(descriptions[step])} wide onclose={() => !busy && onclose()}>
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
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{t('settings-encryption-backup')}</p>
			{/if}
		{:else if !error}
			<p class="text-[13px] text-[var(--text-muted)]">{t('settings-encryption-checking')}</p>
		{/if}
	{:else if step === 'key'}
		<RecoveryKey {key} onsave={() => saveRecoveryKey(key)} onprint={() => printRecoveryKey(key)} />
		<Checkbox label={t('settings-recovery-saved')} checked={saved} onchange={(checked) => (saved = checked)}>{t('settings-recovery-saved')}</Checkbox>
	{:else if step === 'unlock'}
		{#if tpm.usable}
			<div class="flex items-center gap-4 px-1">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="text-[14px] font-medium">{t('settings-encryption-ask-pin')}</span>
					<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">{t('settings-encryption-ask-pin-description')}</span>
				</div>
				<Switch label={t('settings-encryption-ask-pin')} checked={usePin} onchange={(on) => (usePin = on)} />
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
					<span>{t(sentence)}</span>
				</li>
			{/each}
		</ol>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if step === 'check'}
			<button type="button" class="button" disabled={busy} onclick={onclose}>{blocked ? t('settings-protection-close') : t('settings-protection-cancel')}</button>
			{#if !blocked}
				<button type="button" class="button primary" disabled={busy || !checks} onclick={next}>{t('settings-protection-continue')}</button>
			{/if}
		{:else}
			<button type="button" class="button" disabled={busy} onclick={back}>{t('settings-encryption-back')}</button>
			{#if step === 'summary'}
				<button type="button" class="button primary" disabled={busy} onclick={encrypt}>{busy ? t('settings-encryption-starting-button') : t('settings-encryption-restart-and-encrypt')}</button>
			{:else}
				<button type="button" class="button primary" disabled={(step === 'key' && !saved) || (step === 'unlock' && !unlockReady)} onclick={next}>{t('settings-protection-continue')}</button>
			{/if}
		{/if}
	{/snippet}
</Dialog>
