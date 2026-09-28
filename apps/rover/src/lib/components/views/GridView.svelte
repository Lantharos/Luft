<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import type { Attachment } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import VcsBadge from '$lib/components/vcs/VcsBadge.svelte';
	import { thumbnailSource } from '$lib/file-manager/listing/thumbnails';
	import { entryClasses, entryContext, entryProps } from '$lib/file-manager/view/entry-props';
	import { EntrySurface } from '$lib/file-manager/view/surface.svelte';
	import { entryIcon } from '$lib/utils/file-kinds';
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
				<EntryIcon name={entryIcon(entry)} {size} thumbnail={thumbnailSource(entry)} fit="contain" />
				<VcsBadge status={vcs.statusFor(entry.path, entry.is_dir)} density="grid" />
			</span>
			<EntryName {entry} manager={context.manager} class="grid-name" fieldClass="inline-name-field--grid" />
		</div>
	{/snippet}
</VirtualScroller>
