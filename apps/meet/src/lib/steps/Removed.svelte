<script lang="ts">
	import { t } from '@luft/i18n';
	import { appWindow, isAvailable } from '@lantharos/sabine';
	import { session } from '#lib/state/meet.svelte.js';
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[40px] leading-none font-semibold tracking-[-0.01em]">{t('removed-title')}</h1>
	<p class="mt-5 max-w-[470px] text-[16px] leading-relaxed text-[var(--text-soft)]">
		{t('removed-description', { platform: session.platform })}
	</p>
	<div class="mt-9">
		<button type="button" class="button large px-6" onclick={() => isAvailable() && appWindow.close()}>{t('meet-close')}</button>
	</div>
</section>
