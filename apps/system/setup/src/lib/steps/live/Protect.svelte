<script lang="ts">
	import { t } from '@luft/i18n';
	import { PasswordField, Spinner } from '@luft/ui';
	import { commands, type Encryption } from '#lib/bindings.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import KeyBackup from '#lib/components/trust/KeyBackup.svelte';
	import { install } from '#lib/state/install.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';
	import { begin } from './begin.js';
	import ConfirmInstall from './ConfirmInstall.svelte';

	const SHORTEST_PASSPHRASE = 8;

	let passphrase = $state('');
	let repeated = $state('');
	let problem = $state('');
	let confirming = $state<{ encryption: Encryption | null } | null>(null);

	let chip = $derived(setup.trust?.tpm ?? false);
	let tpm = $derived(chip && setup.trust?.secureBoot === 'on');
	let description = $derived(tpm ? 'setup-protect-tpm' : chip ? 'setup-protect-passphrase-secure-boot-off' : 'setup-protect-passphrase');
	let passphraseReady = $derived(tpm || (passphrase.length >= SHORTEST_PASSPHRASE && passphrase === repeated));
	let ready = $derived(Boolean(install.recoveryKey) && install.recoveryKeyKept && passphraseReady);

	$effect(() => {
		if (install.recoveryKey) return;
		void commands
			.trustRecoveryKey()
			.then((made) => (install.recoveryKey = made))
			.catch((error) => (problem = String(error)));
	});

	function choose(encrypt: boolean) {
		confirming = { encryption: encrypt ? { recoveryKey: install.recoveryKey, passphrase: tpm ? '' : passphrase } : null };
	}

	async function start(encryption: Encryption | null) {
		confirming = null;
		if (install.target) await begin(install.target, encryption);
	}
</script>

<StepFrame title={t('setup-protect-title')} description={t(description)} hideBack={install.starting}>
	<div class="flex flex-col gap-5">
		<p class="max-w-[540px] text-[14px] leading-relaxed text-[var(--text-soft)]">{t('setup-protect-keep-safe')}</p>
		{#if install.recoveryKey}
			<KeyBackup key={install.recoveryKey} onkept={() => (install.recoveryKeyKept = true)} />
		{/if}
		{#if !tpm}
			<div class="grid grid-cols-2 gap-3">
				<PasswordField bind:value={passphrase} label={t('setup-protect-passphrase-label')} showLabel autocomplete="new-password" />
				<PasswordField bind:value={repeated} label={t('setup-protect-repeat')} showLabel autocomplete="new-password" error={repeated && repeated !== passphrase ? t('setup-protect-mismatch') : ''} live />
			</div>
		{/if}
	</div>
	{#if problem || install.startError}
		<p class="mt-4 text-[13.5px] text-[var(--danger)]">{problem || install.startError}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large" disabled={install.starting} onclick={() => choose(false)}>{t('setup-protect-skip')}</button>
		<button type="button" class="button primary large px-6" disabled={!ready || install.starting} onclick={() => choose(true)}>
			{#if install.starting}<Spinner />{/if}{t(install.starting ? 'setup-destination-starting' : 'setup-protect-encrypt')}
		</button>
	{/snippet}
</StepFrame>

{#if confirming && install.target}
	{@const encryption = confirming.encryption}
	<ConfirmInstall target={install.target} onconfirm={() => start(encryption)} onclose={() => (confirming = null)} />
{/if}
