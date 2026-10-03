<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Drive, Segment, Volume } from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { inner, volumeName } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import { imageActions } from './images';

	interface Props {
		drive: Drive;
		volume: Volume;
	}

	let { drive, volume }: Props = $props();

	const SHRINKS = 2 | 8;
	const GROWS = 4 | 16;

	let contents = $derived(inner(volume));
	let locked = $derived(Boolean(volume.encryption && !volume.encryption.cleartext));
	let mounted = $derived(contents.mountPoints.length > 0);
	let filesystem = $derived(contents.usage === 'filesystem');
	let busy = $derived(disks.busy.has(volume.block) || Boolean(volume.job ?? contents.job));
	let protectedVolume = $derived(volume.system || Boolean(volume.encryption?.cleartext?.system));
	let editable = $derived(!protectedVolume && !drive.readOnly);
	let partition = $derived(volume.number !== null);
	let room = $derived(roomAfter(drive.segments, volume));
	let resizable = $derived(canResize());
	let remembered = $state(false);

	$effect(() => {
		remembered = false;
		if (volume.encryption) void api.remembered(volume.block).then((value) => (remembered = value));
	});

	function roomAfter(segments: Segment[], target: Volume) {
		const index = segments.findIndex((segment) => segment.kind === 'volume' && segment.block === target.block);
		const next = segments[index + 1];
		return next?.kind === 'free' ? next.size : 0;
	}

	function canResize() {
		if (!editable || !partition || volume.encryption) return false;
		const flags = disks.support(volume.fsType)?.resize ?? 0;
		return (room > 0 && (flags & GROWS) !== 0) || (volume.used !== null && (flags & SHRINKS) !== 0);
	}

	function act(action: () => Promise<unknown>) {
		void disks.run(volume.block, action);
	}

	function unlock() {
		void disks.run(volume.block, async () => {
			if (!(await api.unlock(volume.block, null, false))) dialogs.open({ kind: 'unlock', volume });
		});
	}
</script>

<div class="flex flex-wrap items-center gap-2 px-1.5">
	{#if mounted}
		<button type="button" class="button" onclick={() => api.openFolder(contents.mountPoints[0])}>Open</button>
	{/if}
	{#if editable}
		{#if locked}
			<button type="button" class="button primary" disabled={busy} onclick={unlock}>Unlock</button>
		{:else if filesystem}
			{#if mounted}
				<button type="button" class="button" disabled={busy} onclick={() => act(() => api.unmount(contents.block))}>Unmount</button>
			{:else}
				<button type="button" class="button primary" disabled={busy} onclick={() => act(() => api.mount(contents.block))}>Mount</button>
			{/if}
		{/if}
		{#if volume.encryption?.cleartext}
			<button type="button" class="button" disabled={busy} onclick={() => act(() => api.lock(volume.block))}>Lock</button>
		{/if}
		<button type="button" class="button" disabled={busy} onclick={() => dialogs.open({ kind: 'format-volume', drive, volume })}>Format…</button>
		<MenuButton label="More actions for {volumeName(volume)}" class="icon-button" align="end" minWidth={220} disabled={busy}>
			{#snippet trigger()}
				<Ellipsis size={18} />
			{/snippet}
			{#snippet children(close)}
				{#if filesystem}
					<MenuItem onclick={() => (close(), dialogs.open({ kind: 'label', volume: contents }))}>Rename…</MenuItem>
					{#if !drive.removable}
						<MenuItem onclick={() => (close(), dialogs.open({ kind: 'startup', volume: contents }))}>Mount at startup…</MenuItem>
					{/if}
				{/if}
				{#if resizable}
					<MenuItem onclick={() => (close(), dialogs.open({ kind: 'resize', volume, room }))}>Resize…</MenuItem>
				{/if}
				{#if volume.encryption}
					<MenuItem onclick={() => (close(), dialogs.open({ kind: 'passphrase', volume }))}>Change passphrase…</MenuItem>
					{#if remembered}
						<MenuItem onclick={() => (close(), act(() => api.forgetPassphrase(volume.block).then(() => (remembered = false))))}>Forget saved passphrase</MenuItem>
					{/if}
				{/if}
				<MenuSeparator />
				{#each imageActions(drive, volume.block, volumeName(volume)) as action (action.label)}
					<MenuItem onclick={() => (close(), action.run())}>{action.label}</MenuItem>
				{/each}
				{#if partition}
					<MenuSeparator />
					<MenuItem danger onclick={() => (close(), dialogs.open({ kind: 'delete', drive, volume }))}>Delete partition…</MenuItem>
				{/if}
			{/snippet}
		</MenuButton>
	{:else if protectedVolume}
		<p class="text-[13px] text-[var(--text-muted)]">The running system uses this partition, so it can't be changed while the system is running.</p>
	{/if}
</div>
