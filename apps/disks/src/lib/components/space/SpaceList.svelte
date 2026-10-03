<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import Files from '@lucide/svelte/icons/files';
	import Folder from '@lucide/svelte/icons/folder';
	import { bytes } from '@luft/ui';
	import ActionMenu from '../ActionMenu.svelte';
	import type { Action } from '../actions';
	import type { Tile } from './tiles';

	interface Props {
		tiles: Tile[];
		hovered: string | null;
		onhover: (key: string | null) => void;
		onopen: (tile: Tile) => void;
		actions: (tile: Tile) => Action[][];
	}

	let { tiles, hovered, onhover, onopen, actions }: Props = $props();

	const TONES = ['var(--accent)', 'var(--tertiary)', 'var(--secondary)'];
</script>

<div class="row-group" role="list" aria-label="What's in this folder">
	{#each tiles as tile (tile.key)}
		<div class={['row', hovered === tile.key && 'lit']} role="listitem" onpointerenter={() => onhover(tile.key)} onpointerleave={() => onhover(null)}>
			<button type="button" class="main" disabled={tile.kind !== 'dir'} onclick={() => onopen(tile)}>
				<span class="icon" style:color={tile.kind === 'dir' ? TONES[tile.tone] : undefined}>
					{#if tile.kind === 'dir'}
						<Folder size={18} />
					{:else if tile.kind === 'file'}
						<FileIcon size={18} />
					{:else}
						<Files size={18} />
					{/if}
				</span>
				<span class="name">{tile.label}</span>
				<span class="facts">{tile.detail}</span>
				<span class="size">{bytes(tile.size)}</span>
			</button>
			<span class="menu">
				{#if tile.kind === 'dir' || tile.kind === 'file'}
					<ActionMenu label="More for {tile.name}" groups={actions(tile)} />
				{/if}
			</span>
		</div>
	{/each}
</div>

<style>
	.row {
		display: flex;
		min-height: 48px;
		align-items: center;
		padding-right: 12px;
		transition: background-color 160ms var(--ease);
	}

	.row.lit {
		background: color-mix(in oklab, var(--ink) 3%, transparent);
	}

	.main {
		display: flex;
		min-width: 0;
		flex: 1;
		align-self: stretch;
		align-items: center;
		gap: 12px;
		padding: 0 12px 0 16px;
		text-align: left;
	}

	.main:disabled {
		cursor: default;
	}

	.icon {
		display: grid;
		flex: none;
		place-items: center;
		color: var(--text-muted);
	}

	.name {
		min-width: 0;
		overflow: hidden;
		font-size: 14px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.facts {
		flex: none;
		font-size: 13px;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.size {
		margin-left: auto;
		flex: none;
		font-size: 13px;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}

	.menu {
		display: flex;
		width: 32px;
		flex: none;
		justify-content: center;
	}
</style>
