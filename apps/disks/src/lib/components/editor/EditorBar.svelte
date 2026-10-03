<script lang="ts">
	import { bytes } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { place } from '#lib/editor/edits.js';
	import type { Limits } from '#lib/editor/limits.js';
	import { alignDown, end, gaps, MiB, type Layout, type Part } from '#lib/editor/model.js';

	interface Props {
		layout: Layout;
		total: number;
		limits: Limits | null;
		tones: Map<string, string>;
	}

	let { layout, total, limits, tones }: Props = $props();

	type Mode = 'start' | 'end' | 'move';

	let bar = $state<HTMLDivElement>();
	let drag = $state.raw<{ mode: Mode; part: Part; limits: Limits; x: number } | null>(null);

	let free = $derived(gaps(layout));
	let selected = $derived(layout.parts.find((part) => part.key === editor.selected) ?? null);
	let resizable = $derived(Boolean(limits && (limits.smallest < (selected?.size ?? 0) || limits.largest > (selected?.size ?? 0))));
	let roomy = $derived(Boolean(limits && selected && (limits.before < selected.offset || limits.after > end(selected))));

	const share = (value: number) => `${(value / total) * 100}%`;
	const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

	function grab(event: PointerEvent, mode: Mode) {
		if (!selected || !limits || editor.running) return;
		event.preventDefault();
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { mode, part: selected, limits, x: event.clientX };
	}

	function follow(event: PointerEvent) {
		if (!drag || !bar) return;
		const { mode, part, limits: bounds } = drag;
		const delta = Math.round(((event.clientX - drag.x) / bar.clientWidth) * total / MiB) * MiB;
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

<div bind:this={bar} class="bar" role="presentation" onpointermove={follow} onpointerup={release} onpointercancel={release}>
	{#each free as gap (gap.offset)}
		<button
			type="button"
			class={['free', editor.selected === `free:${gap.offset}` && 'chosen']}
			style:left={share(gap.offset)}
			style:width={share(gap.size)}
			aria-label="Free space, {bytes(gap.size)}"
			onclick={() => (editor.selected = `free:${gap.offset}`)}
		>
			<span class="text">{bytes(gap.size)} free</span>
		</button>
	{/each}
	{#each layout.parts as part (part.key)}
		{@const chosen = part.key === editor.selected}
		<button
			type="button"
			class={['part', chosen && 'chosen', part.pending && 'pending', chosen && roomy && limits?.movable && 'movable']}
			style:left={share(part.offset)}
			style:width={share(part.size)}
			style:--tone={tones.get(part.key) ?? 'var(--accent)'}
			aria-label="{part.title}, {bytes(part.size)}"
			onclick={() => (editor.selected = part.key)}
			onpointerdown={(event) => chosen && roomy && limits?.movable && grab(event, 'move')}
		>
			{#if part.used !== null && !part.replaced}
				<span class="used" style:width="{Math.min(100, (part.used / part.size) * 100)}%"></span>
			{/if}
			<span class="text"><span class="name">{part.title}</span> {bytes(part.size)}</span>
		</button>
		{#if chosen && resizable}
			{#if limits?.movable}
				<span class="handle" style:left={share(part.offset)} role="presentation" onpointerdown={(event) => grab(event, 'start')}></span>
			{/if}
			<span class="handle" style:left={share(end(part))} role="presentation" onpointerdown={(event) => grab(event, 'end')}></span>
		{/if}
	{/each}
</div>

<style>
	.bar {
		position: relative;
		height: 64px;
		touch-action: none;
		user-select: none;
	}

	.part,
	.free {
		position: absolute;
		top: 0;
		bottom: 0;
		min-width: 4px;
		overflow: hidden;
		border-radius: 10px;
		padding: 0 10px;
		text-align: left;
		transition:
			box-shadow 160ms var(--ease),
			background-color 160ms var(--ease);
	}

	.part {
		background: color-mix(in oklab, var(--tone) 26%, transparent);
		box-shadow: inset 0 0 0 1.5px var(--content);
	}

	.part.pending {
		background: color-mix(in oklab, var(--tone) 16%, transparent);
		outline: 1.5px dashed color-mix(in oklab, var(--tone) 70%, transparent);
		outline-offset: -4px;
	}

	.free {
		background: var(--surface);
		box-shadow: inset 0 0 0 1px var(--hairline);
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
		background: color-mix(in oklab, var(--tone) 55%, transparent);
	}

	.text {
		position: relative;
		display: block;
		overflow: hidden;
		font-size: 12px;
		color: var(--text-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.name {
		font-weight: 600;
		color: var(--text);
	}

	.handle {
		position: absolute;
		top: 50%;
		z-index: 1;
		height: 32px;
		width: 10px;
		border-radius: var(--radius-pill);
		background: var(--accent);
		box-shadow: 0 0 0 3px var(--content);
		cursor: ew-resize;
		transform: translate(-50%, -50%);
	}
</style>
