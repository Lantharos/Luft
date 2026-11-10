<script lang="ts">
	import { t } from '@luft/i18n';
	import { session } from '#lib/state/meet.svelte.js';
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[40px] leading-none font-semibold tracking-[-0.01em]">{t('packed-title')}</h1>
	<p class="mt-5 max-w-[520px] text-[16px] leading-relaxed text-[var(--text-soft)]">{t('packed-description')}</p>
	<p class="code mt-8 text-[34px] leading-none font-medium select-text">{session.boxCode}</p>
	<p class="mt-5 max-w-[520px] text-[14px] leading-relaxed text-[var(--text-muted)]">{t('packed-lost')}</p>
	<div class="mt-9 flex gap-3">
		<button type="button" class="button primary large px-6" onclick={() => session.go('ready')}>{t('packed-done')}</button>
	</div>
</section>

<style>
	.code {
		font-family: 'Maple Mono NF', ui-monospace, monospace;
		letter-spacing: 0.04em;
	}
</style>
