<script lang="ts">
	import { t } from '@luft/i18n';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[52px] leading-none font-semibold tracking-[-0.02em]">Meet Luft</h1>
	<p class="mt-5 max-w-[470px] text-[17px] leading-relaxed text-[var(--text-soft)]">
		{t('hello-intro', { platform: session.platform })}
	</p>
	<div class="mt-9 flex items-center gap-3">
		<button type="button" class="button primary large px-6" onclick={() => session.check()}>
			{t('hello-check', { platform: session.platform })}
		</button>
		<button type="button" class="plain-button large" onclick={() => maker.open()}>{t('stick-title')}</button>
	</div>
</section>
