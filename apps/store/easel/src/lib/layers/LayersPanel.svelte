<script lang="ts">
	import { blendLabel } from '#lib/app/labels.js';
	import Copy from '@luft/symbols/icons/copy';
	import Ellipsis from '@luft/symbols/icons/ellipsis';
	import LayersMerge from '@luft/symbols/icons/layers-merge';
	import Lock from '@luft/symbols/icons/lock';
	import LockOpen from '@luft/symbols/icons/lock-open';
	import Pencil from '@luft/symbols/icons/pencil';
	import Plus from '@luft/symbols/icons/plus';
	import Trash from '@luft/symbols/icons/trash-2';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, MenuSeparator, Select, tooltip } from '@luft/ui';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { addLayer, deleteLayer, duplicateLayer, mergeDown, moveLayer } from '#lib/document/layer-actions.js';
	import { BLEND_MODES } from '#lib/gpu/shaders/blend.js';
	import OptionSlider from '#lib/editor/options/OptionSlider.svelte';
	import LayerRow from './LayerRow.svelte';

	let { doc }: { doc: ImageDocument } = $props();

	const ROW = 50;
	const DRAG_FROM = 4;

	let renaming = $state<string | null>(null);
	let drag = $state<{ id: string; startY: number; offset: number; moved: boolean } | null>(null);
	let list = $state<HTMLDivElement>();
	let shown = $derived([...doc.layers].reverse());
	let active = $derived(doc.active);
	let dropAt = $derived(drag?.moved ? Math.max(0, Math.min(shown.length - 1, shown.findIndex((layer) => layer.id === drag!.id) + Math.round(drag.offset / ROW))) : null);

	function grab(id: string, event: PointerEvent) {
		if (event.button !== 0) return;
		drag = { id, startY: event.clientY, offset: 0, moved: false };
		list?.setPointerCapture(event.pointerId);
	}

	function follow(event: PointerEvent) {
		if (!drag) return;
		const offset = event.clientY - drag.startY;
		drag = { ...drag, offset, moved: drag.moved || Math.abs(offset) > DRAG_FROM };
	}

	function release() {
		const current = drag;
		drag = null;
		if (!current?.moved || dropAt === null) return;
		const layer = doc.layers.find((candidate) => candidate.id === current.id)!;
		moveLayer(doc, layer, shown.length - 1 - dropAt);
	}

	function rename(layer: (typeof shown)[number], name: string | null) {
		renaming = null;
		if (name !== null && name.trim() && name !== layer.name) doc.changeState(t('easel-history-rename-layer'), layer, { name: name.trim() });
	}
</script>

<section class="flex min-h-0 flex-1 flex-col gap-1" aria-label={t('easel-layers')}>
	<div class="flex items-center gap-1 px-1 pb-1.5">
		<h2 class="flex-1 text-[14px] font-semibold">{t('easel-layers')}</h2>
		<button type="button" class="icon-button" aria-label={t('easel-layer-add')} onclick={() => addLayer(doc)} {@attach tooltip(t('easel-layer-add'))}><Plus size={17} /></button>
		<MenuButton label={t('easel-layer-more')} class="icon-button" align="end">
			{#snippet trigger()}<Ellipsis size={17} />{/snippet}
			{#snippet children(close)}
				<MenuItem onclick={() => (close(), duplicateLayer(doc, active))}><Copy size={16} />{t('easel-layer-duplicate')}</MenuItem>
				<MenuItem disabled={doc.layers.indexOf(active) < 1} onclick={() => (close(), mergeDown(doc, active))}><LayersMerge size={16} />{t('easel-layer-merge')}</MenuItem>
				<MenuItem onclick={() => (close(), (renaming = active.id))}><Pencil size={16} />{t('easel-layer-rename')}</MenuItem>
				<MenuItem onclick={() => (close(), doc.changeState(t(active.locked ? 'easel-layer-unlock' : 'easel-layer-lock'), active, { locked: !active.locked }))}>
					{#if active.locked}<LockOpen size={16} />{t('easel-layer-unlock')}{:else}<Lock size={16} />{t('easel-layer-lock')}{/if}
				</MenuItem>
				<MenuSeparator />
				<MenuItem danger disabled={doc.layers.length < 2} onclick={() => (close(), deleteLayer(doc, active))}><Trash size={16} />{t('easel-layer-delete')}</MenuItem>
			{/snippet}
		</MenuButton>
	</div>
	<div bind:this={list} class="flex min-h-0 flex-1 flex-col overflow-y-auto hidden-scroll" role="listbox" aria-label={t('easel-layers')} tabindex="-1" onpointermove={follow} onpointerup={release} onpointercancel={() => (drag = null)}>
		{#each shown as layer, index (layer.id)}
			<div class="relative" style:transform={drag?.moved && drag.id === layer.id ? `translateY(${drag.offset}px)` : undefined} style:z-index={drag?.id === layer.id ? 2 : undefined}>
				{#if dropAt === index && drag?.id !== layer.id}<span class="drop"></span>{/if}
				<LayerRow {doc} {layer} renaming={renaming === layer.id} onrename={(name) => (name === '' ? (renaming = layer.id) : rename(layer, name))} ongrab={(event) => grab(layer.id, event)} />
			</div>
		{/each}
	</div>
	<div class="flex flex-col gap-3 pt-2">
		<Select label={t('easel-layer-blend')} value={active.blend} options={BLEND_MODES.map((mode) => ({ value: mode, label: blendLabel[mode]() }))} onchange={(blend) => doc.changeState(t('easel-history-blend'), active, { blend })} />
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
