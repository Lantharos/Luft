<script lang="ts">
	import { t } from '@luft/i18n';
	import { EncryptionWizard, PassphraseFields, Switch, type EncryptionCheck } from '@luft/ui';
	import StrengthMeter from '#lib/panels/system/accounts/users/StrengthMeter.svelte';
	import { MINIMUM_LENGTH, measure } from '#lib/panels/system/accounts/users/strength.js';
	import { checkEncryption, generateRecoveryKey, printRecoveryKey, restart, saveRecoveryKey, turnOnEncryption, type Tpm } from '../api';
	import PinFields from './unlocking/PinFields.svelte';
	import { pinReady } from './unlocking/pin';

	let { tpm, onclose }: { tpm: Tpm; onclose: () => void } = $props();

	let checks = $state.raw<EncryptionCheck[] | null>(null);
	let usePin = $state(false);
	let pin = $state('');
	let pinConfirmation = $state('');
	let passphrase = $state('');
	let passphraseConfirmation = $state('');

	let blocked = $derived(checks?.some((check) => !check.passed) ?? false);
	let strength = $derived(passphrase ? measure(passphrase, []) : null);
	let unlockReady = $derived(
		tpm.usable ? !usePin || pinReady(pin, pinConfirmation) : passphrase.length >= MINIMUM_LENGTH && passphrase === passphraseConfirmation
	);

	let titles = $derived({
		check: blocked ? t('settings-encryption-blocked-title') : t('settings-encryption-turn-on-title'),
		key: t('settings-encryption-key-title'),
		unlock: tpm.usable ? t('settings-encryption-unlock-title') : t('settings-encryption-passphrase-title'),
		summary: t('settings-encryption-summary-title')
	});

	let descriptions = $derived({
		check: blocked ? t('settings-encryption-blocked-description') : t('settings-encryption-turn-on-description'),
		key: t('settings-encryption-key-description'),
		unlock: tpm.usable ? t('settings-encryption-unlock-description') : t('settings-encryption-passphrase-description'),
		summary: t('settings-encryption-summary-description')
	});

	let summary = $derived([
		t('settings-encryption-step-restart'),
		t('settings-encryption-step-screen'),
		t('settings-encryption-step-background'),
		t('settings-encryption-step-plugged-in')
	]);

	async function check() {
		checks = await checkEncryption();
		return checks;
	}

	async function encrypt(key: string) {
		await turnOnEncryption(key, tpm.usable && usePin ? pin : '', tpm.usable ? '' : passphrase);
		await restart();
	}
</script>

<EncryptionWizard
	{titles}
	{descriptions}
	{check}
	{blocked}
	advice={t('settings-encryption-backup')}
	recoveryKey={generateRecoveryKey}
	onsave={saveRecoveryKey}
	onprint={printRecoveryKey}
	{unlockReady}
	{summary}
	finish={t('settings-encryption-restart-and-encrypt')}
	finishing={t('settings-encryption-starting-button')}
	onfinish={encrypt}
	{onclose}
>
	{#snippet unlock(next)}
		{#if tpm.usable}
			<div class="flex items-center gap-4 px-1">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="text-[14px] font-medium">{t('settings-encryption-ask-pin')}</span>
					<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">{t('settings-encryption-ask-pin-description')}</span>
				</div>
				<Switch label={t('settings-encryption-ask-pin')} checked={usePin} onchange={(on) => (usePin = on)} />
			</div>
			{#if usePin}
				<PinFields bind:pin bind:confirmation={pinConfirmation} onsubmit={next} />
			{/if}
		{:else}
			<PassphraseFields bind:passphrase bind:confirmation={passphraseConfirmation} minimum={MINIMUM_LENGTH} onsubmit={next}>
				{#if strength}
					<StrengthMeter {strength} />
				{/if}
			</PassphraseFields>
		{/if}
	{/snippet}
</EncryptionWizard>
