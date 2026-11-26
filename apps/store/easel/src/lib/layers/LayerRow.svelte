<script lang="ts">
	import Eye from '@luft/symbols/icons/eye';
	import EyeOff from '@luft/symbols/icons/eye-off';
	import Lock from '@luft/symbols/icons/lock';
	import Type from '@luft/symbols/icons/type';
	import { t } from '@luft/i18n';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import type { Layer } from '#lib/document/layers.svelte.js';
	import LayerThumb from './LayerThumb.svelte';

	interface Props {
		doc: ImageDocument;
		layer: Layer;
		renaming: boolean;
		onrename: (name: string | null) => void;
		ongrab: (event: PointerEvent) => void;
	}

	let { doc, layer, renaming, onrename, ongrab }: Props = $props();
	let active = $derived(doc.activeId === layer.id);
</script>

<div
	class={['row', active && 'is-active']}
	role="option"
	tabindex="0"
	aria-selected={active}
	aria-label={layer.name}
	onpointerdown={ongrab}
	onclick={() => (doc.activeId = layer.id)}
	onkeydown={(event) => event.key === 'Enter' && (doc.activeId = layer.id)}
	ondblclick={() => onrename('')}
>
	{#if layer.kind === 'text'}
		<span class="grid size-8 flex-none place-items-center rounded-[7px] bg-(--surface)"><Type size={16} /></span>
	{:else}
		<LayerThumb {layer} width={doc.width} height={doc.height} />
	{/if}
	{#if renaming}
		<input
			class="text-field h-8 flex-1"
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
		<span class={['flex-1 truncate', !layer.visible && 'text-(--text-muted)']}>{layer.name}</span>
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
		gap: 10px;
		border-radius: 12px;
		padding-inline: 8px 6px;
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
