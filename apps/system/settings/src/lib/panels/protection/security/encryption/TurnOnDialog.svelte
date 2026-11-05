<script lang="ts">
	import { t } from '@luft/i18n';
	import { EncryptionWizard, PassphraseFields } from '@luft/ui';
	import type { Disk } from '#lib/bindings.js';
	import { encryptDisk, generateRecoveryKey, onBattery, printRecoveryKey, saveRecoveryKey } from '../api';

	const SHORTEST_PASSPHRASE = 8;

	let { disk, onclose }: { disk: Disk; onclose: () => void } = $props();

	let passphrase = $state('');
	let confirmation = $state('');

	let blocked = $state(false);
	let passphraseReady = $derived(passphrase.length >= SHORTEST_PASSPHRASE && passphrase === confirmation);

	async function check() {
		const plugged = !(await onBattery());
		blocked = !disk.canEncrypt || !plugged;
		return [
			{
				id: 'in-place',
				passed: disk.canEncrypt,
				sentence: disk.canEncrypt ? t('settings-encryption-check-in-place') : t('settings-encryption-check-not-in-place')
			},
			{ id: 'power', passed: plugged, sentence: plugged ? t('settings-encryption-check-plugged-in') : t('settings-encryption-check-on-battery') }
		];
	}
</script>

<EncryptionWizard
	titles={{
		check: blocked ? t('settings-encryption-turn-on-blocked') : t('settings-encryption-turn-on-title'),
		key: t('settings-encryption-save-key-title'),
		unlock: t('settings-encryption-unlock-title'),
		summary: t('settings-encryption-ready-title')
	}}
	descriptions={{ check: blocked ? undefined : t('settings-encryption-turn-on-description'), key: t('settings-encryption-save-key-description') }}
	{check}
	{blocked}
	recoveryKey={generateRecoveryKey}
	onsave={saveRecoveryKey}
	onprint={printRecoveryKey}
	unlockReady={disk.tpmUnlocks || passphraseReady}
	summary={[
		t('settings-encryption-summary-room'),
		t('settings-encryption-summary-background'),
		disk.tpmUnlocks ? t('settings-encryption-summary-chip') : t('settings-encryption-summary-recovery-key')
	]}
	finish={t('settings-encryption-encrypt')}
	finishing={t('settings-encryption-making-room')}
	onfinish={async (key) => {
		await encryptDisk(key, disk.tpmUnlocks ? '' : passphrase);
	}}
	{onclose}
>
	{#snippet unlock(next)}
		{#if disk.tpmUnlocks}
			<p class="px-1 text-[13px] leading-relaxed text-[var(--text-soft)]">{t('settings-encryption-unlock-chip')}</p>
		{:else}
			<p class="px-1 text-[13px] leading-relaxed text-[var(--text-soft)]">{t('settings-encryption-unlock-passphrase')}</p>
			<PassphraseFields bind:passphrase bind:confirmation minimum={SHORTEST_PASSPHRASE} onsubmit={next} />
		{/if}
	{/snippet}
</EncryptionWizard>
