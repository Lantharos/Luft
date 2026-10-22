<script lang="ts">
	import { t } from '@luft/i18n';
	import { Checkbox, PasswordField, RecoveryKey } from '@luft/ui';
	import { printKey, recoveryKey, saveKey } from '#lib/bridge/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { install } from '#lib/state/install.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';
	import type { Encryption } from '#lib/bridge/installer.js';
	import { begin } from './begin.js';
	import ConfirmInstall from './ConfirmInstall.svelte';

	const SHORTEST_PASSPHRASE = 8;

	let key = $state('');
	let kept = $state(false);
	let passphrase = $state('');
	let repeated = $state('');
	let problem = $state('');
	let confirming = $state<{ encryption: Encryption | null } | null>(null);

	let tpm = $derived(setup.trust?.tpm ?? false);
	let passphraseReady = $derived(tpm || (passphrase.length >= SHORTEST_PASSPHRASE && passphrase === repeated));
	let ready = $derived(Boolean(key) && kept && passphraseReady);

	$effect(() => {
		void recoveryKey()
			.then((made) => (key = made))
			.catch((error) => (problem = String(error)));
	});

	function choose(encrypt: boolean) {
		confirming = { encryption: encrypt ? { recoveryKey: key, passphrase: tpm ? '' : passphrase } : null };
	}

	async function start(encryption: Encryption | null) {
		confirming = null;
		if (install.target) await begin(install.target, encryption);
	}
</script>

<StepFrame title={t('setup-protect-title')} description={t(tpm ? 'setup-protect-tpm' : 'setup-protect-passphrase')} hideBack={install.starting}>
	<div class="flex max-w-[560px] flex-col gap-5">
		<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">{t('setup-protect-keep-safe')}</p>
		{#if key}
			<RecoveryKey {key} onsave={() => saveKey(key)} onprint={() => printKey(key)} copyable={false} />
		{/if}
		{#if !tpm}
			<div class="grid grid-cols-2 gap-3">
				<PasswordField bind:value={passphrase} label={t('setup-protect-passphrase-label')} showLabel autocomplete="new-password" />
				<PasswordField bind:value={repeated} label={t('setup-protect-repeat')} showLabel autocomplete="new-password" error={repeated && repeated !== passphrase ? t('setup-protect-mismatch') : ''} live />
			</div>
		{/if}
		<Checkbox checked={kept} label={t('setup-protect-kept')} onchange={(checked) => (kept = checked)}>{t('setup-protect-kept')}</Checkbox>
		<p class="text-[13.5px] text-[var(--text-muted)]">{t('setup-protect-only-now')}</p>
	</div>
	{#if problem || install.startError}
		<p class="mt-4 text-[13.5px] text-[var(--danger)]">{problem || install.startError}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large" disabled={install.starting} onclick={() => choose(false)}>{t('setup-protect-skip')}</button>
		<button type="button" class="button primary large px-6" disabled={!ready || install.starting} onclick={() => choose(true)}>
			{t(install.starting ? 'setup-destination-starting' : 'setup-protect-encrypt')}
		</button>
	{/snippet}
</StepFrame>

{#if confirming && install.target}
	{@const encryption = confirming.encryption}
	<ConfirmInstall target={install.target} onconfirm={() => start(encryption)} onclose={() => (confirming = null)} />
{/if}
