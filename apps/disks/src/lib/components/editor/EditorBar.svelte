<script lang="ts">
	import { bytes, tooltip } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { place } from '#lib/editor/edits.js';
	import type { Limits } from '#lib/editor/limits.js';
	import { alignDown, end, gaps, MiB, type Layout, type Part, type Span } from '#lib/editor/model.js';
	import { fit, type Placed } from './fit';

	interface Props {
		layout: Layout;
		limits: Limits | null;
		tones: Map<string, string>;
		onplaced: (box: Placed | null) => void;
	}

	let { layout, limits, tones, onplaced }: Props = $props();

	type Mode = 'start' | 'end' | 'move';
	type Segment = { key: string; span: Span; part: Part | null };

	const GAP = 3;
	const SLIVER = 14;
	const LABELLED = 56;

	let width = $state(0);
	let drag = $state.raw<{ mode: Mode; part: Part; limits: Limits; x: number; pixelsPerByte: number } | null>(null);

	let segments = $derived(
		[
			...layout.parts.map((part): Segment => ({ key: part.key, span: part, part })),
			...gaps(layout).map((gap): Segment => ({ key: `free:${gap.offset}`, span: gap, part: null }))
		].sort((a, b) => a.span.offset - b.span.offset)
	);
	let fitted = $derived(fit(segments.map((segment) => segment.span.size), width, GAP, SLIVER));
	let chosen = $derived(segments.findIndex((segment) => segment.key === editor.selected));
	let selected = $derived(segments[chosen]?.part ?? null);
	let box = $derived(chosen === -1 ? null : fitted.placed[chosen]);
	let resizable = $derived(Boolean(limits && selected && (limits.smallest < selected.size || limits.largest > selected.size)));
	let movable = $derived(Boolean(limits?.movable && selected && (limits.before < selected.offset || limits.after > end(selected))));

	$effect(() => onplaced(box ?? null));

	const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

	function grab(event: PointerEvent, mode: Mode) {
		if (!selected || !limits || editor.running) return;
		event.preventDefault();
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { mode, part: selected, limits, x: event.clientX, pixelsPerByte: fitted.pixelsPerByte };
	}

	function follow(event: PointerEvent) {
		if (!drag || !drag.pixelsPerByte) return;
		const { mode, part, limits: bounds } = drag;
		const delta = Math.round((event.clientX - drag.x) / drag.pixelsPerByte / MiB) * MiB;
		const stop = end(part);
		if (mode === 'end') {
			const size = clamp(part.size + delta, bounds.smallest, Math.min(bounds.largest, bounds.after - part.offset));
			editor.draft = { key: part.key, offset: part.offset, size };
		} else if (mode === 'start') {
			const offset = clamp(part.offset + delta, Math.max(bounds.before, stop - bounds.largest), stop - bounds.smallest);
			editor.draft = { key: part.key, offset, size: alignDown(stop - offset) };
		} else {
			editor.draft = { key: part.key, offset: clamp(part.offset + delta, bounds.before, bounds.after - part.size), size: part.size };
		}
	}

	function release() {
		const draft = editor.draft;
		const part = drag?.part;
		drag = null;
		editor.draft = null;
		if (draft && part) place(part, draft.offset, draft.size);
	}
</script>

<div bind:clientWidth={width} class="bar" role="presentation" onpointermove={follow} onpointerup={release} onpointercancel={release}>
	{#each segments as segment, index (segment.key)}
		{@const placed = fitted.placed[index]}
		{@const part = segment.part}
		{@const name = part ? part.title : 'Free space'}
		<button
			type="button"
			class={['segment', index === segments.length - 1 && 'last', !part && 'free', part?.pending && 'pending', index === chosen && 'chosen', index === chosen && movable && 'movable']}
			style:left="{placed.left}px"
			style:width="{placed.width}px"
			style:--tone={part ? (tones.get(part.key) ?? 'var(--accent)') : undefined}
			aria-label="{name}, {bytes(segment.span.size)}"
			{@attach tooltip(`${name} · ${bytes(segment.span.size)}`)}
			onclick={() => editor.select(segment.key)}
			onpointerdown={(event) => index === chosen && movable && grab(event, 'move')}
		>
			{#if part && part.used !== null && !part.replaced}
				<span class="used" style:width="{Math.min(100, (part.used / part.size) * 100)}%"></span>
			{/if}
			{#if placed.width >= LABELLED}
				<span class="label">
					{#if part}<span class="name">{part.title}</span>{/if}
					<span>{bytes(segment.span.size)}{part ? '' : ' free'}</span>
				</span>
			{/if}
		</button>
	{/each}
	{#if box && resizable}
		{#if limits?.movable}
			<span class="handle" style:left="{box.left}px" role="presentation" onpointerdown={(event) => grab(event, 'start')}></span>
		{/if}
		<span class="handle" style:left="{box.left + box.width}px" role="presentation" onpointerdown={(event) => grab(event, 'end')}></span>
	{/if}
</div>

<style>
	.bar {
		position: relative;
		height: 76px;
		touch-action: none;
		user-select: none;
	}

	.segment {
		position: absolute;
		top: 0;
		bottom: 0;
		overflow: hidden;
		border-radius: 10px;
		background: color-mix(in oklab, var(--tone) 24%, transparent);
		text-align: left;
		transition:
			box-shadow 160ms var(--ease),
			background-color 160ms var(--ease);
	}

	.segment:first-child {
		border-top-left-radius: 18px;
		border-bottom-left-radius: 18px;
	}

	.segment.last {
		border-top-right-radius: 18px;
		border-bottom-right-radius: 18px;
	}

	.segment:hover:not(.free) {
		background: color-mix(in oklab, var(--tone) 32%, transparent);
	}

	.pending {
		background: color-mix(in oklab, var(--tone) 14%, transparent);
		outline: 1.5px dashed color-mix(in oklab, var(--tone) 70%, transparent);
		outline-offset: -4px;
	}

	.free {
		background: var(--surface);
	}

	.free:hover {
		background: var(--surface-hover);
	}

	.chosen {
		box-shadow: inset 0 0 0 2px var(--accent);
	}

	.movable {
		cursor: grab;
	}

	.movable:active {
		cursor: grabbing;
	}

	.used {
		position: absolute;
		inset: 0 auto 0 0;
		background: color-mix(in oklab, var(--tone) 50%, transparent);
	}

	.label {
		position: absolute;
		inset: auto 12px 10px 12px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-size: 12px;
		line-height: 1.35;
		color: var(--text-soft);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.label > span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}

	.handle {
		position: absolute;
		top: 50%;
		z-index: 1;
		height: 36px;
		width: 10px;
		border-radius: var(--radius-pill);
		background: var(--accent);
		box-shadow: 0 0 0 3px var(--content);
		cursor: ew-resize;
		transform: translate(-50%, -50%);
	}
</style>
