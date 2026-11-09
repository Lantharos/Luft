<script lang="ts">
	import { t } from '@luft/i18n';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let heading = $derived.by(() => {
		if (!flatbed.scanner) return t('welcome-camera');
		return flatbed.feed === 'glass' ? t('welcome-glass') : t('welcome-feeder');
	});
</script>

<div class="flex h-full flex-col items-center justify-center gap-2 px-10 pb-28 text-center">
	<h2 class="max-w-[440px] text-[20px] font-semibold text-balance">{heading}</h2>
	<p class="max-w-[400px] text-[14px] leading-[1.5] text-pretty text-[var(--text-soft)]">{t('welcome-drop')}</p>
</div>
