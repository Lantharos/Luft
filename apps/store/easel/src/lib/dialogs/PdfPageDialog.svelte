<script lang="ts">
	import { t } from '@luft/i18n';
	import ChevronLeft from '@luft/symbols/icons/chevron-left';
	import ChevronRight from '@luft/symbols/icons/chevron-right';
	import { Dialog, tooltip } from '@luft/ui';
	import { pdfPreview } from '#lib/files/picture.js';

	interface Props {
		path: string;
		pages: number;
		onopen: (page: number) => void;
		onclose: () => void;
	}

	let { path, pages, onopen, onclose }: Props = $props();
	let page = $state(0);
	let canvas = $state<HTMLCanvasElement>();

	$effect(() => {
		const shown = page;
		const target = canvas;
		if (!target) return;
		void pdfPreview(path, shown).then((image) => {
			if (shown !== page) return;
			target.width = image.width;
			target.height = image.height;
			target.getContext('2d')!.putImageData(image, 0, 0);
		});
	});
</script>

<Dialog title={t('easel-pdf-choose-page')} {onclose}>
	<div class="flex flex-col items-center gap-3">
		<canvas bind:this={canvas} class="h-72 max-w-full rounded-md object-contain"></canvas>
		<div class="flex items-center gap-2">
			<button type="button" class="icon-button" aria-label={t('easel-pdf-previous-page')} disabled={page === 0} onclick={() => page--} {@attach tooltip(t('easel-pdf-previous-page'))}><ChevronLeft size={18} /></button>
			<span class="min-w-28 text-center text-[13px] tabular-nums">{t('easel-pdf-page-of', { number: page + 1, pages })}</span>
			<button type="button" class="icon-button" aria-label={t('easel-pdf-next-page')} disabled={page === pages - 1} onclick={() => page++} {@attach tooltip(t('easel-pdf-next-page'))}><ChevronRight size={18} /></button>
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
		<button type="button" class="button primary" onclick={() => onopen(page)}>{t('easel-pdf-open-page')}</button>
	{/snippet}
</Dialog>
