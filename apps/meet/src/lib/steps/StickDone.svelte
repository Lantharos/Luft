<script lang="ts">
	import { t } from '@luft/i18n';
	import { maker } from '#lib/state/stick.svelte.js';

	let made = $derived(maker.made);
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[40px] leading-none font-semibold tracking-[-0.01em]">
		{made?.ventoy ? t('stick-done-ventoy-title') : t('stick-done-title')}
	</h1>
	<p class="mt-5 max-w-[500px] text-[16px] leading-relaxed text-[var(--text-soft)]">
		{made?.ejected ? t('stick-done-take-out') : t('stick-done-eject')}
		{t('stick-done-start')}
	</p>
	{#if made?.ventoy}
		<p class="mt-3 max-w-[500px] text-[14px] leading-relaxed text-[var(--text-muted)]">
			{t('stick-done-ventoy-key')}
		</p>
	{/if}
	<div class="mt-9 flex gap-3">
		<button type="button" class="button primary large px-6" onclick={() => maker.back()}>{t('stick-done')}</button>
		<button type="button" class="button large px-6" onclick={() => maker.open()}>{t('stick-done-another')}</button>
	</div>
</section>
