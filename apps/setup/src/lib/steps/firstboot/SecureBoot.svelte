<script lang="ts">
	import { t } from '@luft/i18n';
	import { enrollKey, restart } from '#lib/api/system.js';
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
			setup.secureBootCode = await enrollKey();
		} catch (error) {
			problem = String(error);
		} finally {
			busy = false;
		}
	}

	async function restartNow() {
		problem = '';
		await restart().catch((error) => (problem = String(error)));
	}
</script>

<StepFrame
	title={t('setup-secure-boot-title')}
	description={t(setup.secureBootCode ? 'setup-secure-boot-code' : 'setup-secure-boot-skipped')}
>
	<EnrollSteps code={setup.secureBootCode} />
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		{#if setup.secureBootCode}
			<button type="button" class="plain-button large" onclick={() => flow.next()}>{t('setup-restart-later')}</button>
			<button type="button" class="button primary large px-6" onclick={restartNow}>{t('setup-restart-now')}</button>
		{:else}
			<button type="button" class="plain-button large" disabled={busy} onclick={() => flow.next()}>{t('setup-not-now')}</button>
			<button type="button" class="button primary large px-6" disabled={busy} onclick={getCode}>{t(busy ? 'setup-secure-boot-getting' : 'setup-secure-boot-new-code')}</button>
		{/if}
	{/snippet}
</StepFrame>
