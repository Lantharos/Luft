<script lang="ts">
	import { t } from '@luft/i18n';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';

	let release = $derived(install.status?.release);
</script>

<StepFrame title={t('setup-early-title')} description={t('setup-early-body')}>
	<div class="flex max-w-[540px] flex-col gap-4 text-[15px] leading-relaxed text-[var(--text-soft)]">
		<p>{t('setup-early-reports')}</p>
		{#if release?.nightly}
			<p>{t(release.stableReleased ? 'setup-early-nightly-stable' : 'setup-early-nightly')}</p>
		{/if}
		<p class="mt-2 text-[13.5px] text-[var(--text-muted)] select-text">{t('setup-early-report')}</p>
	</div>
	{#snippet actions()}
		<button type="button" class="button primary large px-6" onclick={() => flow.next()}>{t('setup-continue')}</button>
	{/snippet}
</StepFrame>
