<script lang="ts">
	import Ellipsis from '@luft/symbols/icons/ellipsis';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { canMerge, deleteLayer, duplicateLayer, groupLayer, mergeDown, ungroup } from '#lib/document/layer-actions.js';
	import type { Layer } from '#lib/document/layers.svelte.js';
	import { addMask, applyMask, deleteMask, invertMask } from '#lib/document/masks.js';

	interface Props {
		doc: ImageDocument;
		layer: Layer;
		onrename: () => void;
		onadjust: (layerId: string) => void;
		oneffects: (layerId: string) => void;
	}

	let { doc, layer, onrename, onadjust, oneffects }: Props = $props();
</script>

<MenuButton label={t('easel-layer-more')} class="icon-button" align="end">
	{#snippet trigger()}<Ellipsis size={17} />{/snippet}
	{#snippet children(close)}
		{#if layer.kind === 'adjustment'}
			<MenuItem onclick={() => (close(), onadjust(layer.id))}>{t('easel-adjustment-edit')}</MenuItem>
		{/if}
		<MenuItem onclick={() => (close(), duplicateLayer(doc, layer))}>{t('easel-layer-duplicate')}</MenuItem>
		<MenuItem disabled={!canMerge(doc, layer)} onclick={() => (close(), mergeDown(doc, layer))}>{t('easel-layer-merge')}</MenuItem>
		<MenuItem onclick={() => (close(), onrename())}>{t('easel-layer-rename')}</MenuItem>
		<MenuItem onclick={() => (close(), doc.changeState(t(layer.locked ? 'easel-layer-unlock' : 'easel-layer-lock'), layer, { locked: !layer.locked }))}>{layer.locked ? t('easel-layer-unlock') : t('easel-layer-lock')}</MenuItem>
		{#if layer.kind === 'raster' || layer.kind === 'text'}
			<MenuItem onclick={() => (close(), oneffects(layer.id))}>{t('easel-effects')}</MenuItem>
		{/if}
		<MenuSeparator />
		{#if layer.kind === 'group'}
			<MenuItem onclick={() => (close(), ungroup(doc, layer))}>{t('easel-layer-ungroup')}</MenuItem>
		{:else}
			<MenuItem onclick={() => (close(), groupLayer(doc, layer))}>{t('easel-layer-group')}</MenuItem>
		{/if}
		{#if layer.mask}
			<MenuItem onclick={() => (close(), invertMask(doc, layer))}>{t('easel-mask-invert')}</MenuItem>
			<MenuItem onclick={() => (close(), doc.changeState(t('easel-history-mask-toggle'), layer, { maskEnabled: !layer.maskEnabled }))}>{layer.maskEnabled ? t('easel-mask-disable') : t('easel-mask-enable')}</MenuItem>
			{#if layer.kind === 'raster'}
				<MenuItem onclick={() => (close(), applyMask(doc, layer))}>{t('easel-mask-apply')}</MenuItem>
			{/if}
			<MenuItem onclick={() => (close(), deleteMask(doc, layer))}>{t('easel-mask-delete')}</MenuItem>
		{:else}
			<MenuItem onclick={() => (close(), addMask(doc, layer, false))}>{t('easel-mask-add')}</MenuItem>
			<MenuItem disabled={!doc.selectionActive} onclick={() => (close(), addMask(doc, layer, true))}>{t('easel-mask-from-selection')}</MenuItem>
		{/if}
		<MenuSeparator />
		<MenuItem danger disabled={doc.layers.length < 2} onclick={() => (close(), deleteLayer(doc, layer))}>{t('easel-layer-delete')}</MenuItem>
	{/snippet}
</MenuButton>
