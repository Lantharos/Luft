<script lang="ts">
	import { t } from '@luft/i18n';
	import { basename } from '@luft/ui';
	import { showInFolder } from '#lib/bridge/index.js';
	import { openFile } from '#lib/app/actions.js';
	import { library } from '#lib/library/library.svelte.js';
	import OpenWithMenu from './OpenWithMenu.svelte';
</script>

<div class="grid h-full place-items-center p-8">
	<div class="flex max-w-[420px] flex-col items-center gap-2 text-center">
		{#if library.unopenable}
			<h2 class="text-[18px] font-semibold">{t('magpie-unopenable-title', { name: basename(library.unopenable) })}</h2>
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{t('magpie-unopenable-body')}</p>
			<div class="mt-5 flex flex-wrap justify-center gap-2">
				<OpenWithMenu path={library.unopenable} />
				<button type="button" class="button" onclick={() => showInFolder(library.unopenable!)}>{t('magpie-show-in-folder')}</button>
			</div>
		{:else}
			<h2 class="text-[20px] font-semibold">{t('magpie-welcome-title')}</h2>
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{t('magpie-welcome-body')}</p>
			<button type="button" class="button primary large mt-5" onclick={openFile}>{t('magpie-open')}</button>
		{/if}
	</div>
</div>
