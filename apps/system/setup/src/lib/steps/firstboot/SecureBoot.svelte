<script lang="ts">
	import { t } from '@luft/i18n';
	import { Spinner } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let busy = $state(false);
	let problem = $state('');

	async function getCode() {
		busy = true;
		problem = '';
		try {
			setup.secureBootCode = await commands.trustEnroll(WAIT_FOR_PERSON);
		} catch (error) {
			problem = String(error);
		} finally {
			busy = false;
		}
	}

	async function restartNow() {
		problem = '';
		await commands.sessionRestart(WAIT_FOR_PERSON).catch((error) => (problem = String(error)));
	}

	$effect(() => {
		if (setup.trust?.key === 'pending' && !setup.secureBootCode) void getCode();
	});
</script>

<StepFrame
	title={t('setup-secure-boot-finish-title')}
	description={t(setup.trust?.key === 'pending' || setup.secureBootCode ? 'setup-secure-boot-pending' : 'setup-secure-boot-not-set-up')}
>
	{#if setup.secureBootCode}
		<EnrollSteps code={setup.secureBootCode} />
		<p class="mt-5 text-[13px] text-[var(--text-muted)]">{t('setup-enroll-missed')}</p>
	{:else if busy}
		<div class="flex items-center gap-3 text-[14px] text-[var(--text-soft)]"><Spinner size={18} />{t('setup-secure-boot-getting')}</div>
	{/if}
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		{#if setup.secureBootCode}
			<button type="button" class="plain-button large" onclick={() => flow.next()}>{t('setup-restart-later')}</button>
			<button type="button" class="button primary large px-6" onclick={restartNow}>{t('setup-restart-now')}</button>
		{:else}
			<button type="button" class="plain-button large" disabled={busy} onclick={() => flow.next()}>{t('setup-not-now')}</button>
			<button type="button" class="button primary large px-6" disabled={busy} onclick={getCode}>{t('setup-secure-boot-get-code')}</button>
		{/if}
	{/snippet}
</StepFrame>
