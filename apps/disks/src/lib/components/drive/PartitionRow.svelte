<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import { bytes } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { Drive, Volume } from '#lib/api.js';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { changing, rowStatus } from '#lib/encryption.svelte.js';
	import { filesystemName, inner, jobText, usedShare, volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import ActionMenu from '../ActionMenu.svelte';
	import { primaryAction, volumeMenu } from '../actions';
	import UsageRing from './UsageRing.svelte';

	interface Props {
		drive: Drive;
		volume: Volume;
		tone: string;
	}

	let { drive, volume, tone }: Props = $props();

	let remembered = $state(false);

	let contents = $derived(inner(volume));
	let locked = $derived(Boolean(volume.encryption && !volume.encryption.cleartext));
	let job = $derived(volume.job ?? contents.job);
	let busy = $derived(disks.busy.has(volume.block) || Boolean(job));
	let primary = $derived(primaryAction(drive, volume));
	let menu = $derived(volumeMenu(drive, volume, remembered));
	let facts = $derived([locked ? 'Encrypted' : filesystemName(contents), bytes(volume.size)].join(' · '));
	let encryption = $derived(disks.encryption(volume));
	let status = $derived(
		job
			? jobText(job)
			: encryption && changing(encryption)
				? rowStatus(encryption)
				: contents.used !== null
					? `${bytes(Math.max(0, volume.size - contents.used))} free`
					: ''
	);

	$effect(() => {
		remembered = false;
		if (volume.encryption) void api.remembered(volume.block).then((value) => (remembered = value));
	});
</script>

<div
	class={['row', disks.hovered === volume.block && 'lit', disks.current === volume.block && 'current']}
	role="listitem"
	onpointerenter={() => (disks.hovered = volume.block)}
	onpointerleave={() => (disks.hovered = null)}
>
	<button type="button" class="main" onclick={() => dialogs.open({ kind: 'details', drive, volume })}>
		<UsageRing {tone} share={usedShare(volume)} {locked} />
		<span class="name">{volumeName(volume)}</span>
		{#if volume.encryption && !locked}
			<Lock size={13} class="flex-none text-[var(--text-muted)]" aria-label="Encrypted" />
		{/if}
		<span class="facts">{facts}</span>
		<span class="status">{status}</span>
	</button>
	<div class="actions">
		{#if primary}
			<button type="button" class="button" disabled={busy} onclick={primary.run}>{primary.label}</button>
		{/if}
		<ActionMenu label="More for {volumeName(volume)}" groups={menu} disabled={busy} />
	</div>
</div>

<style>
	.row {
		display: flex;
		min-height: 56px;
		align-items: center;
		gap: 4px;
		padding-right: 12px;
		transition: background-color 160ms var(--ease);
	}

	.row.lit,
	.row.current {
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

	.name {
		min-width: 0;
		overflow: hidden;
		font-size: 14px;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.facts {
		flex: none;
		font-size: 13px;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.status {
		margin-left: auto;
		flex: none;
		font-size: 13px;
		color: var(--text-soft);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.actions {
		display: flex;
		flex: none;
		align-items: center;
		gap: 6px;
	}
</style>
