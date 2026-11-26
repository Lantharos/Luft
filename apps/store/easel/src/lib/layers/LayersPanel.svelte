<script lang="ts">
	import Plus from '@luft/symbols/icons/plus';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, MenuSeparator, Select } from '@luft/ui';
	import { ADJUSTMENT_TYPES } from '#lib/adjust/adjustments.js';
	import { adjustmentName } from '#lib/adjust/fields.js';
	import { blendLabel } from '#lib/app/labels.js';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { addAdjustment, addLayer, moveLayer } from '#lib/document/layer-actions.js';
	import { BLEND_MODES } from '#lib/gpu/shaders/blend.js';
	import OptionSlider from '#lib/editor/options/OptionSlider.svelte';
	import LayerMenu from './LayerMenu.svelte';
	import LayerRow from './LayerRow.svelte';
	import { rows } from './tree';

	interface Props {
		doc: ImageDocument;
		onadjust: (layerId: string) => void;
		oneffects: (layerId: string) => void;
	}

	let { doc, onadjust, oneffects }: Props = $props();

	const ROW = 48;
	const DRAG_FROM = 4;

	let renaming = $state<string | null>(null);
	let drag = $state<{ id: string; pointer: number; startY: number; offset: number; moved: boolean } | null>(null);
	let list = $state<HTMLDivElement>();
	let shown = $derived(rows(doc.layers));
	let active = $derived(doc.active);
	let dropAt = $derived(drag?.moved ? Math.max(0, Math.min(shown.length - 1, shown.findIndex((row) => row.layer.id === drag!.id) + Math.round(drag.offset / ROW))) : null);

	function grab(id: string, event: PointerEvent) {
		if (event.button !== 0) return;
		drag = { id, pointer: event.pointerId, startY: event.clientY, offset: 0, moved: false };
	}

	function follow(event: PointerEvent) {
		if (!drag) return;
		const offset = event.clientY - drag.startY;
		const moved = drag.moved || Math.abs(offset) > DRAG_FROM;
		if (moved && !drag.moved) list?.setPointerCapture(drag.pointer);
		drag = { ...drag, offset, moved };
	}

	function release() {
		const current = drag;
		drag = null;
		if (!current?.moved || dropAt === null) return;
		const layer = doc.layers.find((candidate) => candidate.id === current.id)!;
		const target = shown[dropAt].layer;
		if (target === layer) return;
		if (target.parent !== layer.parent) doc.changeState(t('easel-history-move-layer'), layer, { parent: target.parent });
		moveLayer(doc, layer, doc.layers.indexOf(target));
	}

	function rename(layer: (typeof shown)[number]['layer'], name: string | null) {
		renaming = null;
		if (name !== null && name.trim() && name !== layer.name) doc.changeState(t('easel-history-rename-layer'), layer, { name: name.trim() });
	}
</script>

<section class="flex min-h-0 flex-1 flex-col gap-1" aria-label={t('easel-layers')}>
	<div class="flex items-center gap-1 px-1 pb-1.5">
		<h2 class="flex-1 text-[14px] font-semibold">{t('easel-layers')}</h2>
		<MenuButton label={t('easel-layer-add')} class="icon-button" align="end">
			{#snippet trigger()}<Plus size={17} />{/snippet}
			{#snippet children(close)}
				<MenuItem onclick={() => (close(), addLayer(doc))}>{t('easel-layer-new')}</MenuItem>
				<MenuSeparator />
				{#each ADJUSTMENT_TYPES as type (type)}
					<MenuItem
						onclick={() => {
							close();
							onadjust(addAdjustment(doc, type, adjustmentName[type]()).id);
						}}>{adjustmentName[type]()}</MenuItem
					>
				{/each}
			{/snippet}
		</MenuButton>
		<LayerMenu {doc} layer={active} onrename={() => (renaming = active.id)} {onadjust} {oneffects} />
	</div>
	<div bind:this={list} class="flex min-h-0 flex-1 flex-col overflow-y-auto hidden-scroll" role="listbox" aria-label={t('easel-layers')} tabindex="-1" onpointermove={follow} onpointerup={release} onpointercancel={() => (drag = null)}>
		{#each shown as row, index (row.layer.id)}
			<div class="relative" style:transform={drag?.moved && drag.id === row.layer.id ? `translateY(${drag.offset}px)` : undefined} style:z-index={drag?.id === row.layer.id ? 2 : undefined}>
				{#if dropAt === index && drag?.id !== row.layer.id}<span class="drop"></span>{/if}
				<LayerRow
					{doc}
					layer={row.layer}
					depth={row.depth}
					renaming={renaming === row.layer.id}
					onrename={(name) => (name === '' ? (renaming = row.layer.id) : rename(row.layer, name))}
					ongrab={(event) => grab(row.layer.id, event)}
					onopen={() => onadjust(row.layer.id)}
				/>
			</div>
		{/each}
	</div>
	<div class="flex flex-col gap-3 pt-2">
		{#if active.kind !== 'adjustment'}
			<Select label={t('easel-layer-blend')} value={active.blend} options={BLEND_MODES.map((mode) => ({ value: mode, label: blendLabel[mode]() }))} onchange={(blend) => doc.changeState(t('easel-history-blend'), active, { blend })} />
		{/if}
		<OptionSlider label={t('easel-option-opacity')} value={Math.round(active.opacity * 100)} min={0} max={100} format={(value) => `${value}%`} onchange={(value) => doc.changeState(t('easel-history-opacity'), active, { opacity: value / 100 }, true)} />
	</div>
</section>

<style>
	.drop {
		position: absolute;
		inset-inline: 8px;
		top: -2px;
		height: 2px;
		border-radius: 2px;
		background: var(--accent);
	}
</style>
