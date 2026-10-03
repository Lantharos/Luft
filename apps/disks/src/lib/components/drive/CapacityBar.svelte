<script lang="ts">
	import type { Drive, Segment } from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { bytes, segmentName, usedShare } from '$lib/format';
	import { disks, segmentKey } from '$lib/state/disks.svelte';
	import { tones } from './tones';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let palette = $derived(tones(drive));

	function open(segment: Segment) {
		if (segment.kind === 'volume') dialogs.open({ kind: 'details', drive, volume: segment });
		else if (drive.table && !drive.readOnly) dialogs.open({ kind: 'create', drive, offset: segment.offset, size: segment.size });
	}
</script>

<div class="bar" role="presentation" onpointerleave={() => (disks.hovered = null)}>
	{#each drive.segments as segment (segmentKey(segment))}
		{@const key = segmentKey(segment)}
		{@const share = usedShare(segment)}
		<button
			type="button"
			tabindex="-1"
			aria-label="{segmentName(segment)}, {bytes(segment.size)}"
			class={['segment', segment.kind === 'free' && 'free', disks.hovered === key && 'lit', disks.hovered && disks.hovered !== key && 'dim']}
			style:flex-grow={segment.size}
			style:--tone={segment.kind === 'volume' ? palette.get(segment.block) : undefined}
			onpointerenter={() => (disks.hovered = key)}
			onclick={() => open(segment)}
		>
			{#if share !== null}
				<span class="used" style:transform="scaleX({share})"></span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.bar {
		display: flex;
		height: 48px;
		gap: 3px;
	}

	.segment {
		position: relative;
		min-width: 6px;
		flex-basis: 0;
		overflow: hidden;
		border-radius: 8px;
		background: color-mix(in oklab, var(--tone) 24%, transparent);
		transition:
			opacity 180ms var(--ease),
			background-color 180ms var(--ease);
	}

	.segment:first-child {
		border-top-left-radius: 16px;
		border-bottom-left-radius: 16px;
	}

	.segment:last-child {
		border-top-right-radius: 16px;
		border-bottom-right-radius: 16px;
	}

	.segment.free {
		background: var(--surface);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	.segment.lit {
		background: color-mix(in oklab, var(--tone) 34%, transparent);
	}

	.segment.free.lit {
		background: var(--surface-hover);
	}

	.segment.dim {
		opacity: 0.5;
	}

	.used {
		position: absolute;
		inset: 0;
		background: var(--tone);
		transform-origin: left;
		transition: transform 300ms var(--ease);
	}
</style>
