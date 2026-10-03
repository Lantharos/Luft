<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import type { Drive, Segment } from '$lib/api';
	import { bytes, filesystemName, inner, volumeName } from '$lib/format';
	import { disks, segmentKey } from '$lib/state/disks.svelte';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let selected = $derived(disks.segment ? segmentKey(disks.segment) : null);

	function usedShare(segment: Segment) {
		if (segment.kind !== 'volume') return 0;
		const volume = inner(segment);
		return volume.used === null || volume.size === 0 ? 0 : Math.min(1, volume.used / volume.size);
	}

	function keydown(event: KeyboardEvent, index: number) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		const next = drive.segments[index + step];
		if (!step || !next) return;
		event.preventDefault();
		disks.select(drive.id, segmentKey(next));
		(event.currentTarget as HTMLElement).closest('.map')?.children[index + step]?.querySelector('button')?.focus();
	}
</script>

<div class="map" role="listbox" aria-label="Partitions">
	{#each drive.segments as segment, index (segmentKey(segment))}
		{@const key = segmentKey(segment)}
		{@const used = usedShare(segment)}
		<div class="slot" style:flex-grow={segment.size}>
			<button
				type="button"
				role="option"
				aria-selected={key === selected}
				class={['segment', segment.kind === 'free' && 'free', key === selected && 'selected']}
				onclick={() => disks.select(drive.id, key)}
				onkeydown={(event) => keydown(event, index)}
			>
				{#if segment.kind === 'volume'}
					<span class="name">
						{#if segment.encryption}
							{#if segment.encryption.cleartext}
								<LockOpen size={13} class="shrink-0" />
							{:else}
								<Lock size={13} class="shrink-0" />
							{/if}
						{/if}
						<span class="truncate">{volumeName(segment)}</span>
					</span>
					<span class="detail">{bytes(segment.size)} {filesystemName(inner(segment))}</span>
					{#if used > 0}
						<span class="usage" style:transform="scaleX({used})"></span>
					{/if}
				{:else}
					<span class="name"><span class="truncate">Free space</span></span>
					<span class="detail">{bytes(segment.size)}</span>
				{/if}
			</button>
		</div>
	{/each}
</div>

<style>
	.map {
		display: flex;
		height: 76px;
		gap: 4px;
	}

	.slot {
		display: flex;
		min-width: 64px;
		flex-basis: 0;
	}

	.segment {
		position: relative;
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
		overflow: hidden;
		border-radius: 14px;
		background: var(--control);
		padding: 0 14px;
		text-align: left;
		transition: background-color 160ms var(--ease), box-shadow 160ms var(--ease);
	}

	.slot:first-child .segment {
		border-top-left-radius: 22px;
		border-bottom-left-radius: 22px;
	}

	.slot:last-child .segment {
		border-top-right-radius: 22px;
		border-bottom-right-radius: 22px;
	}

	.segment:hover {
		background: var(--control-hover);
	}

	.segment.free {
		background: var(--surface);
		color: var(--text-muted);
	}

	.segment.free:hover {
		background: var(--surface-hover);
	}

	.segment.selected {
		background: var(--accent-soft);
		box-shadow: inset 0 0 0 2px var(--accent);
	}

	.name {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
	}

	.detail {
		overflow: hidden;
		font-size: 12px;
		color: var(--text-muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.usage {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 4px;
		background: var(--accent-line);
		transform-origin: left;
	}
</style>
