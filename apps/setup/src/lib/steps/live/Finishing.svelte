<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { ProgressBar } from '@luft/ui';
	import { restart, finishSetup } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
	import { install } from '#lib/state/install.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	const STAGES: Record<string, string> = {
		idle: 'setup-stage-idle',
		preparing: 'setup-stage-preparing',
		copying: 'setup-stage-copying',
		waiting: 'setup-stage-waiting',
		configuring: 'setup-stage-configuring',
		finished: 'setup-stage-finished'
	};

	let status = $derived(install.status);
	let code = $derived(status?.secureBootCode ?? '');
	let percent = $derived(Math.round((status?.progress ?? 0) * 100));
	let percentFormat = $derived(new Intl.NumberFormat(i18n.formats, { style: 'percent' }));
	let problem = $state('');
	let fromStick = $derived(!install.intent);

	async function restartNow() {
		problem = '';
		await restart().catch((error) => (problem = String(error)));
	}
</script>

{#if install.failed}
	<StepFrame title={t('setup-finishing-failed-title')} description={status?.error || t('setup-finishing-failed-description')}>
		<p class="max-w-[540px] text-[14px] leading-relaxed text-[var(--text-soft)]">
			{t(fromStick ? 'setup-finishing-failed-stick' : 'setup-finishing-failed-trying')}
		</p>
		{#snippet actions()}
			<button type="button" class="plain-button large" onclick={() => finishSetup()}>{t(fromStick ? 'setup-finishing-use-stick' : 'setup-finishing-keep-trying')}</button>
			<button type="button" class="button large px-6" onclick={restartNow}>{t('setup-restart')}</button>
		{/snippet}
	</StepFrame>
{:else if install.finished && code}
	<StepFrame
		title={t('setup-finishing-installed-title')}
		description={t(fromStick ? 'setup-finishing-trust-stick' : 'setup-finishing-trust')}
	>
		<EnrollSteps {code} />
		{#if problem}
			<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button primary large px-6" onclick={restartNow}>{t('setup-restart-now')}</button>
		{/snippet}
	</StepFrame>
{:else if install.finished}
	<StepFrame
		title={t('setup-finishing-installed-title')}
		description={t(fromStick ? 'setup-finishing-restart-stick' : 'setup-finishing-restart')}
	>
		{#if problem}
			<p class="text-[13.5px] text-[var(--danger)]">{problem}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button primary large px-6" onclick={restartNow}>{t('setup-restart-now')}</button>
		{/snippet}
	</StepFrame>
{:else}
	<StepFrame title={t('setup-finishing-title')} description={t('setup-finishing-description')}>
		<div class="flex max-w-[540px] flex-col gap-3 pt-6">
			<div class="flex items-baseline justify-between text-[15px]">
				<span class="font-medium">{t(STAGES[status?.stage ?? 'idle'])}</span>
				<span class="text-[var(--text-muted)] tabular-nums">{percentFormat.format(percent / 100)}</span>
			</div>
			<ProgressBar fraction={percent / 100} label={t(STAGES[status?.stage ?? 'idle'])} class="h-2 bg-[var(--surface-hover)]" />
			{#if setup.hardware.portable && setup.hardware.onBattery}
				<p class="mt-2 text-[13.5px] text-[var(--text-soft)]">{t('setup-finishing-plug-in')}</p>
			{/if}
		</div>
	</StepFrame>
{/if}
