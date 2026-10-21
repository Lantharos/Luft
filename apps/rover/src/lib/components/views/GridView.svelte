<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import type { Attachment } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import EntryIcon from '#lib/components/pane/EntryIcon.svelte';
	import CloudMark from '#lib/components/cloud/CloudMark.svelte';
	import VcsBadge from '#lib/components/vcs/VcsBadge.svelte';
	import { thumbnailOf } from '#lib/file-manager/listing/thumbnails.js';
	import { entryClasses, entryContext, entryProps } from '#lib/file-manager/view/entry-props.js';
	import { EntrySurface } from '#lib/file-manager/view/surface.svelte.js';
	import { fileKind } from '#lib/utils/kinds.js';
	import EntryName from './EntryName.svelte';

	const WHEEL_STEP = 60;
	const NAME_HEIGHT = 40;

	const context = entryContext();
	const { view, vcs } = context;
	const surface = new EntrySurface(context);
	let size = $derived(view.gridSize);
	let layout = $derived({
		itemHeight: size + NAME_HEIGHT + 14,
		minItemWidth: size + 40,
		gap: 6,
		padding: { top: 10, right: 14, bottom: 28, left: 14 }
	});

	$effect(() => view.attach(surface.viewport));

	const zoomOnWheel: Attachment<HTMLElement> = (node) => {
		let pending = 0;
		return on(
			node,
			'wheel',
			(event) => {
				if (!event.ctrlKey) return;
				event.preventDefault();
				pending += event.deltaY;
				if (Math.abs(pending) < WHEEL_STEP) return;
				view.zoom(pending < 0 ? 1 : -1);
				pending = 0;
			},
			{ passive: false }
		);
	};
</script>

{#snippet overlay()}
	{#if surface.marquee.box}
		<div class="selection-marquee" style={surface.marquee.style}></div>
	{/if}
{/snippet}

<VirtualScroller
	bind:this={surface.scroller}
	class="entry-scroller soft-scroll"
	items={surface.items}
	key={(entry) => entry.path}
	{layout}
	overscan={2}
	stagger={view.motion.stagger}
	animateOrder={view.motion.reordering}
	{overlay}
	role="listbox"
	aria-label="Files"
	aria-multiselectable="true"
	{@attach zoomOnWheel}
	{...surface.pointerHandlers()}
>
	{#snippet children(entry)}
		<div class={[entryClasses(entry, context), 'grid-tile']} {...entryProps(entry, context)}>
			<span class="grid-art" style:height="{size}px">
				<EntryIcon kind={fileKind(entry)} {size} {...thumbnailOf(entry)} fit="contain" />
				<CloudMark state={context.manager.cloud.stateOf(entry.path)} density="grid" />
				<VcsBadge status={vcs.statusFor(entry.path, entry.isDir)} density="grid" />
			</span>
			<EntryName {entry} manager={context.manager} class="grid-name" fieldClass="inline-name-field--grid" />
		</div>
	{/snippet}
</VirtualScroller>

<style>
	.grid-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 7px 6px 6px;
		border-radius: 14px;
		text-align: center;
	}

	.grid-art {
		position: relative;
		display: grid;
		width: 100%;
		flex: none;
		place-items: center;
	}

	.grid-tile :global(.grid-name) {
		display: -webkit-box;
		max-width: 100%;
		flex: none;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow-wrap: anywhere;
		font-size: 12.5px;
		line-height: 16px;
	}
</style>
