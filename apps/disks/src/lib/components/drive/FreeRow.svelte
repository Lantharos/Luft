<script lang="ts">
	import type { Drive } from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { bytes } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';

	interface Props {
		drive: Drive;
		offset: number;
		size: number;
	}

	let { drive, offset, size }: Props = $props();

	let key = $derived(`free:${offset}`);
	let blank = $derived(!drive.table);
</script>

<div
	class={['row', disks.hovered === key && 'lit']}
	role="listitem"
	onpointerenter={() => (disks.hovered = key)}
	onpointerleave={() => (disks.hovered = null)}
>
	<span class="dashed" aria-hidden="true"></span>
	<span class="name">{blank ? 'No partitions' : 'Free space'}</span>
	<span class="facts">{bytes(size)}</span>
	{#if !drive.readOnly}
		<button
			type="button"
			class="button ml-auto"
			onclick={() => dialogs.open(blank ? { kind: 'format-drive', drive } : { kind: 'create', drive, offset, size })}
		>
			{blank ? 'Format drive…' : 'New partition…'}
		</button>
	{/if}
</div>

<style>
	.row {
		display: flex;
		min-height: 56px;
		align-items: center;
		gap: 12px;
		padding: 0 12px 0 16px;
		transition: background-color 160ms var(--ease);
	}

	.row.lit {
		background: color-mix(in oklab, var(--ink) 3%, transparent);
	}

	.dashed {
		height: 17px;
		width: 17px;
		flex: none;
		margin: 0 1.5px;
		border: 1.5px dashed var(--text-muted);
		border-radius: 50%;
	}

	.name {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-soft);
	}

	.facts {
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
