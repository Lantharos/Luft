<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented } from '@luft/ui';
	import type { Editor } from '../editor.svelte';

	let { editor }: { editor: Editor } = $props();
	let crop = $derived(editor.crop);
	let doc = $derived(editor.doc);

	let ratios = $derived([
		{ value: 'free', label: t('easel-ratio-free'), ratio: null },
		{ value: 'original', label: t('easel-ratio-original'), ratio: doc.width / doc.height },
		{ value: 'square', label: t('easel-ratio-square'), ratio: 1 },
		{ value: 'wide', label: '16:9', ratio: 16 / 9 }
	]);
	let chosen = $state('free');
</script>

<Segmented
	label={t('easel-option-ratio')}
	value={chosen}
	options={ratios}
	onchange={(value) => {
		chosen = value;
		crop.setRatio(ratios.find((ratio) => ratio.value === value)!.ratio);
	}}
/>
<div class="flex gap-1.5">
	<button type="button" class="chip" onclick={() => crop.start()}>{t('easel-crop-reset')}</button>
	<div class="flex-1"></div>
	<button type="button" class="button primary" disabled={!crop.rect} onclick={() => crop.commit()}>{t('easel-crop-apply')}</button>
</div>
