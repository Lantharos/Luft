<script lang="ts">
	import { t } from '@luft/i18n';
	import { Popover, Segmented, type Side } from '@luft/ui';
	import { tools } from './tools.svelte';

	let { anchor, side, onclose }: { anchor: HTMLElement; side?: Side; onclose: () => void } = $props();
</script>

<Popover {anchor} {side} label={t('toolbar-eraser')} role="dialog" minWidth={280} {onclose}>
	<div class="flex flex-col gap-3 p-3">
		<span class="text-[12px] text-(--text-muted)">{t('eraser-mode')}</span>
		<Segmented
			label={t('eraser-mode')}
			value={tools.eraserMode}
			options={[
				{ value: 'stroke', label: t('eraser-strokes') },
				{ value: 'area', label: t('eraser-area') }
			]}
			onchange={(mode) => tools.setEraser(mode, tools.eraserSize)}
		/>
		<span class="text-[12px] text-(--text-muted)">{t('eraser-size')}</span>
		<Segmented
			label={t('eraser-size')}
			value={tools.eraserSize}
			options={[
				{ value: 'small', label: t('eraser-small') },
				{ value: 'medium', label: t('eraser-medium') },
				{ value: 'large', label: t('eraser-large') }
			]}
			onchange={(size) => tools.setEraser(tools.eraserMode, size)}
		/>
	</div>
</Popover>
