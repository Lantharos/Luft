<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import * as api from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { bytes } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import { space } from '$lib/state/space.svelte';
	import type { Action } from '../actions';
	import SpaceList from './SpaceList.svelte';
	import { tilesOf, type Tile } from './tiles';
	import Treemap from './Treemap.svelte';

	let update = $derived(space.update);
	let view = $derived(space.view);
	let tiles = $derived(view ? tilesOf(view) : []);
	let crumbs = $derived(space.path.length ? [space.name, ...space.path] : [update?.root ?? space.name]);
	let status = $derived.by(() => {
		if (!update) return '';
		const unreadable = update.unreadable ? ` · ${update.unreadable.toLocaleString()} ${update.unreadable === 1 ? 'folder' : 'folders'} couldn't be read` : '';
		if (update.scanning) return `Measuring… ${update.totalItems.toLocaleString()} items${unreadable}`;
		return view ? `${bytes(view.size)} in ${view.items.toLocaleString()} items${unreadable}` : '';
	});

	function open(tile: Tile) {
		if (tile.kind === 'dir') void space.go([...space.path, tile.name]);
	}

	function actions(tile: Tile): Action[][] {
		const path = [...space.path, tile.name];
		const show: Action = { label: 'Show in Rover', run: () => void api.space.show(path).catch((caught) => disks.fail(caught)) };
		const trash: Action = { label: 'Move to trash…', danger: true, run: () => dialogs.open({ kind: 'trash', path, name: tile.name, size: tile.size, folder: tile.kind === 'dir' }) };
		return [[show], tile.done ? [trash] : []];
	}
</script>

<svelte:window onkeydown={(event) => (event.key === 'Backspace' || (event.altKey && event.key === 'ArrowUp')) && !dialogs.current && space.up()} />

<section class="flex flex-col gap-5">
	<div class="flex min-h-9 items-center gap-2 px-1.5">
		<nav class="flex min-w-0 flex-1 items-center gap-1 text-[14px] text-[var(--text-muted)]" aria-label="Folders">
			{#each crumbs as crumb, index (index)}
				{#if index > 0}
					<span aria-hidden="true">›</span>
				{/if}
				{#if index < crumbs.length - 1}
					<button type="button" class="crumb" onclick={() => space.go(space.path.slice(0, index))}>{crumb}</button>
				{:else}
					<span class="truncate text-[var(--text-soft)]">{crumb}</span>
				{/if}
			{/each}
		</nav>
		<span class="flex-none text-[13px] text-[var(--text-muted)] tabular-nums">{status}</span>
		<button type="button" class="icon-button" aria-label="Measure again" disabled={update?.scanning} onclick={() => space.refresh()}>
			<RefreshCw size={17} />
		</button>
	</div>
	{#if view && tiles.length}
		<Treemap {tiles} hovered={space.hovered} onhover={(key) => (space.hovered = key)} onopen={open} />
		<SpaceList {tiles} hovered={space.hovered} onhover={(key) => (space.hovered = key)} onopen={open} {actions} />
	{:else}
		<p class="px-1.5 pt-6 text-[14px] text-[var(--text-muted)]">{view ? 'This folder is empty.' : 'Measuring…'}</p>
	{/if}
</section>

<style>
	.crumb {
		max-width: 180px;
		flex: none;
		overflow: hidden;
		border-radius: var(--radius-pill);
		padding: 2px 6px;
		margin: 0 -6px;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color 160ms var(--ease), background-color 160ms var(--ease);
	}

	.crumb:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
