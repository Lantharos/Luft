<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { t } from '@luft/i18n';
	import { Checkbox, PasswordField, RecoveryKey } from '@luft/ui';
	import { encrypt, encryptionChecks, printKey, recoveryKey, saveKey, type Check } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let key = $state('');
	let kept = $state(false);
	let passphrase = $state('');
	let repeated = $state('');
	let failing = $state<Check[]>([]);
	let busy = $state(false);
	let problem = $state('');

	let tpm = $derived(setup.trust?.tpm ?? false);
	let staged = $derived(setup.stagedRecoveryKey);
	let ready = $derived(kept && (tpm || (passphrase.length > 0 && passphrase === repeated)));

	async function attempt(action: () => Promise<void>) {
		busy = true;
		problem = '';
		try {
			await action();
		} catch (error) {
			problem = String(error);
		} finally {
			busy = false;
		}
	}

	const prepare = () =>
		attempt(async () => {
			failing = (await encryptionChecks()).filter((check) => !check.passed);
			if (!failing.length) key = await recoveryKey();
		});

	const turnOn = () =>
		attempt(async () => {
			await encrypt(key, tpm ? '' : passphrase);
			setup.stagedRecoveryKey = key;
			flow.next();
		});
</script>

{#snippet keepSafe(key: string)}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
		{t('setup-protect-keep-safe')}
	</p>
	<RecoveryKey {key} onsave={() => saveKey(key)} onprint={() => printKey(key)} copyable={false} />
{/snippet}

{#if staged}
	<StepFrame
		title={t('setup-protect-staged-title')}
		description={t('setup-protect-staged-description')}
	>
		<div class="flex max-w-[560px] flex-col gap-5">
			{@render keepSafe(staged)}
		</div>
		{#snippet actions()}
			<button type="button" class="button primary large px-6" onclick={() => flow.next()}>{t('setup-continue')}</button>
		{/snippet}
	</StepFrame>
{:else}
	<StepFrame
		title={t('setup-protect-title')}
		description={t(tpm ? 'setup-protect-tpm' : 'setup-protect-passphrase')}
		hideBack={busy}
	>
		{#if failing.length}
			<ul class="flex max-w-[560px] flex-col gap-2 text-[14px] leading-relaxed">
				{#each failing as check (check.id)}
					<li>{check.sentence}</li>
				{/each}
			</ul>
		{:else if key}
			<div class="flex max-w-[560px] flex-col gap-5">
				{@render keepSafe(key)}
				{#if !tpm}
					<div class="grid grid-cols-2 gap-3">
						<PasswordField bind:value={passphrase} label={t('setup-protect-passphrase-label')} showLabel autocomplete="new-password" />
						<PasswordField bind:value={repeated} label={t('setup-protect-repeat')} showLabel autocomplete="new-password" error={repeated && repeated !== passphrase ? t('setup-protect-mismatch') : ''} live />
					</div>
				{/if}
				<Checkbox checked={kept} label={t('setup-protect-kept')} onchange={(checked) => (kept = checked)}>{t('setup-protect-kept')}</Checkbox>
			</div>
		{:else}
			<div class="flex items-center gap-4 text-[14px] leading-relaxed text-[var(--text-soft)]">
				<span class="grid h-14 w-14 flex-none place-items-center rounded-[18px] bg-[var(--accent-soft)] text-[var(--accent)]"><LockKeyhole size={26} /></span>
				<p class="max-w-[480px]">{t('setup-protect-background')}</p>
			</div>
		{/if}
		{#if problem}
			<p class="mt-4 text-[13.5px] text-[var(--danger)]">{problem}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="plain-button large" disabled={busy} onclick={() => flow.next()}>{t('setup-not-now')}</button>
			{#if key}
				<button type="button" class="button primary large px-6" disabled={!ready || busy} onclick={turnOn}>{t('setup-protect-encrypt')}</button>
			{:else if !failing.length}
				<button type="button" class="button primary large px-6" disabled={busy} onclick={prepare}>{t(busy ? 'setup-protect-checking' : 'setup-protect-start')}</button>
			{/if}
		{/snippet}
	</StepFrame>
{/if}
