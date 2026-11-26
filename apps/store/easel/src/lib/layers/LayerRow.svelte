<script lang="ts">
	import ChevronDown from '@luft/symbols/icons/chevron-down';
	import ChevronRight from '@luft/symbols/icons/chevron-right';
	import Eye from '@luft/symbols/icons/eye';
	import EyeOff from '@luft/symbols/icons/eye-off';
	import Folder from '@luft/symbols/icons/folder';
	import Lock from '@luft/symbols/icons/lock';
	import Sliders from '@luft/symbols/icons/sliders-horizontal';
	import Type from '@luft/symbols/icons/type';
	import { t } from '@luft/i18n';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import type { Layer } from '#lib/document/layers.svelte.js';
	import LayerThumb from './LayerThumb.svelte';

	interface Props {
		doc: ImageDocument;
		layer: Layer;
		depth: number;
		renaming: boolean;
		onrename: (name: string | null) => void;
		ongrab: (event: PointerEvent) => void;
		onopen: () => void;
	}

	let { doc, layer, depth, renaming, onrename, ongrab, onopen }: Props = $props();
	let active = $derived(doc.activeId === layer.id);

	function choose(mask: boolean) {
		doc.activeId = layer.id;
		doc.maskEditing = mask && layer.mask !== null;
	}
</script>

<div
	class={['row', active && 'is-active']}
	style:padding-left="{8 + depth * 18}px"
	role="option"
	tabindex="0"
	aria-selected={active}
	aria-label={layer.name}
	onpointerdown={ongrab}
	onclick={() => choose(active && doc.maskEditing)}
	onkeydown={(event) => event.key === 'Enter' && choose(false)}
	ondblclick={() => (layer.kind === 'adjustment' ? onopen() : onrename(''))}
>
	{#if layer.kind === 'group'}
		<button
			type="button"
			class="fold"
			aria-label={layer.collapsed ? t('easel-group-open') : t('easel-group-close')}
			onpointerdown={(event) => event.stopPropagation()}
			onclick={(event) => {
				event.stopPropagation();
				layer.collapsed = !layer.collapsed;
			}}
		>
			{#if layer.collapsed}<ChevronRight size={14} />{:else}<ChevronDown size={14} />{/if}
		</button>
		<span class="icon"><Folder size={16} /></span>
	{:else if layer.kind === 'adjustment'}
		<span class="icon"><Sliders size={16} /></span>
	{:else if layer.kind === 'text'}
		<span class="icon"><Type size={16} /></span>
	{:else}
		<button type="button" class={['thumb', active && !doc.maskEditing && layer.mask && 'is-target']} aria-label={t('easel-layer-pixels')} onclick={(event) => (event.stopPropagation(), choose(false))}>
			<LayerThumb {layer} width={doc.width} height={doc.height} />
		</button>
	{/if}
	{#if layer.mask}
		<button type="button" class={['thumb', active && doc.maskEditing && 'is-target', !layer.maskEnabled && 'is-off']} aria-label={t('easel-layer-mask')} onclick={(event) => (event.stopPropagation(), choose(true))}>
			<LayerThumb {layer} width={doc.width} height={doc.height} mask />
		</button>
	{/if}
	{#if renaming}
		<input
			class="text-field h-8 min-w-0 flex-1"
			value={layer.name}
			aria-label={t('easel-layer-rename')}
			{@attach (node) => node.select()}
			onpointerdown={(event) => event.stopPropagation()}
			onkeydown={(event) => {
				if (event.key === 'Enter') onrename(event.currentTarget.value);
				if (event.key === 'Escape') onrename(null);
			}}
			onblur={(event) => onrename(event.currentTarget.value)}
		/>
	{:else}
		<span class={['min-w-0 flex-1 truncate', !layer.visible && 'text-(--text-muted)']}>{layer.name}</span>
	{/if}
	{#if layer.locked}
		<Lock size={14} class="text-(--text-muted)" />
	{/if}
	<button
		type="button"
		class={['eye', !layer.visible && 'is-shown']}
		aria-label={layer.visible ? t('easel-layer-hide') : t('easel-layer-show')}
		onpointerdown={(event) => event.stopPropagation()}
		onclick={(event) => {
			event.stopPropagation();
			doc.changeState(layer.visible ? t('easel-layer-hide') : t('easel-layer-show'), layer, { visible: !layer.visible });
		}}
	>
		{#if layer.visible}<Eye size={16} />{:else}<EyeOff size={16} />{/if}
	</button>
</div>

<style>
	.row {
		display: flex;
		height: 48px;
		flex: none;
		align-items: center;
		gap: 8px;
		border-radius: 12px;
		padding-right: 6px;
		color: var(--text-soft);
		font-size: 13px;
		font-weight: 500;
		outline-offset: -2px;
	}

	.row:hover {
		background: var(--surface);
	}

	.row.is-active {
		background: var(--surface-hover);
		color: var(--text);
	}

	.icon {
		display: grid;
		height: 32px;
		width: 32px;
		flex: none;
		place-items: center;
		border-radius: 7px;
		background: var(--surface);
	}

	.thumb {
		display: grid;
		flex: none;
		border-radius: 9px;
		padding: 1px;
	}

	.thumb.is-target {
		box-shadow: 0 0 0 2px var(--accent-line);
	}

	.thumb.is-off {
		opacity: 0.4;
	}

	.fold {
		display: grid;
		height: 20px;
		width: 16px;
		place-items: center;
		color: var(--text-muted);
	}

	.eye {
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		opacity: 0;
	}

	.row:hover .eye,
	.row:focus-within .eye,
	.eye.is-shown {
		opacity: 1;
	}

	.eye:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
