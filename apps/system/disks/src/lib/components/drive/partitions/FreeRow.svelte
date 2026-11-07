<script lang="ts">
	import { bytes, Spinner } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { luftRoom } from '#lib/luft.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		drive: Drive;
		offset: number;
		size: number;
	}

	let { drive, offset, size }: Props = $props();

	let key = $derived(`free:${offset}`);
	let blank = $derived(!drive.table);
	let room = $derived(luftRoom(drive, offset));
	let waiting = $derived(disks.protection.systemResize === 'grow' && room?.reach.kind === 'before');
	let calling = $derived(disks.busy.has(key));

	function callOff() {
		void disks.run(key, () => commands.disksCancelSystemResize(WAIT));
	}
</script>

<div
	class={['row', disks.hovered === key && 'lit']}
	role="listitem"
	onpointerenter={() => (disks.hovered = key)}
	onpointerleave={() => (disks.hovered = null)}
>
	<span class="dashed" aria-hidden="true"></span>
	<span class="name">{blank ? 'No partitions' : 'Free space'}</span>
	<span class="facts">{waiting ? `${bytes(size)}, Luft moves in at the next start` : bytes(size)}</span>
	{#if waiting}
		<button type="button" class="button ml-auto" disabled={calling} onclick={callOff}>
			{#if calling}<Spinner />{/if}Keep it free
		</button>
	{:else if room && !drive.readOnly}
		<div class="ml-auto flex gap-2">
			<button type="button" class="button" onclick={() => dialogs.open({ kind: 'give-luft', drive, offset, size })}>Give to Luft</button>
			<button type="button" class="button" aria-label="New partition" onclick={() => dialogs.open({ kind: 'create', drive, offset, size })}>New</button>
		</div>
	{:else if !drive.readOnly}
		<button
			type="button"
			class="button ml-auto"
			aria-label={blank ? undefined : 'New partition'}
			onclick={() => dialogs.open(blank ? { kind: 'format-drive', drive } : { kind: 'create', drive, offset, size })}
		>
			{blank ? 'Format drive…' : 'New'}
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
		transition: background-color var(--motion-tap) var(--ease-decelerate);
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
