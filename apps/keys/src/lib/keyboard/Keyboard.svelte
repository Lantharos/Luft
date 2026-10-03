<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Board } from './board';
	import { caps, CODES, HEIGHT, WIDTH, type Cap } from './geometry';
	import KeyCap from './KeyCap.svelte';

	interface Props {
		board: Board;
		level?: number | null;
		inspector?: Snippet;
		onpicked?: () => void;
		onlatch?: (name: string) => void;
		onescape?: () => void;
	}

	let { board, level = null, inspector, onpicked, onlatch, onescape }: Props = $props();

	const SHIFTS = ['LFSH', 'RTSH'];
	const LOWEST_ROW_BELOW = 2;

	let element = $state<HTMLDivElement>();
	let shown = $derived(caps(board.geometry));
	let altGr = $derived(board.usesThirdLevel);
	let selected = $derived(shown.find((cap) => cap.name === board.selected));

	export function focus() {
		element?.querySelector<HTMLButtonElement>('.cap[aria-pressed="true"]')?.focus();
	}

	function latchable(name: string) {
		return !!onlatch && (SHIFTS.includes(name) || (name === 'RALT' && altGr));
	}

	function place(cap: Cap) {
		const height = cap.enter ? 2 : 1;
		return `left:${(cap.x / WIDTH) * 100}%;top:${(cap.y / HEIGHT) * 100}%;width:${(cap.width / WIDTH) * 100}%;height:${(height / HEIGHT) * 100}%`;
	}

	function beside(cap: Cap) {
		const center = ((cap.x + cap.width / 2) / WIDTH) * 100;
		const left = `left:clamp(0px, calc(${center}% - var(--inspector-width) / 2), calc(100% - var(--inspector-width)))`;
		return cap.y > LOWEST_ROW_BELOW ? `${left};bottom:calc(${100 - (cap.y / HEIGHT) * 100}% + 6px)` : `${left};top:calc(${((cap.y + 1) / HEIGHT) * 100}% + 6px)`;
	}

	function label(cap: Cap) {
		return cap.name === 'RALT' && altGr ? 'AltGr' : cap.label;
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && onescape) {
			event.preventDefault();
			onescape();
			return;
		}
		const name = CODES[event.code];
		if (!name || event.ctrlKey || event.metaKey || !shown.some((cap) => cap.name === name && !cap.label)) return;
		event.preventDefault();
		board.select(name);
		onpicked?.();
	}
</script>

<div bind:this={element} class="board" role="group" aria-label="Keyboard">
	{#each shown as cap (cap.name)}
		<div class="slot" class:enter={cap.enter} style={place(cap)}>
			{#if cap.label && latchable(cap.name)}
				<button type="button" class="modifier latch" class:pressed={board.pressed.has(cap.name)} aria-pressed={board.pressed.has(cap.name)} onclick={() => onlatch?.(cap.name)}
					>{label(cap)}</button
				>
			{:else if cap.label}
				<div class="modifier" class:pressed={board.pressed.has(cap.name)}>{label(cap)}</div>
			{:else}
				<KeyCap
					levels={board.levels(cap.name)}
					{level}
					layer={board.layer ?? null}
					selected={board.selected === cap.name}
					pressed={board.pressed.has(cap.name)}
					onselect={() => board.select(cap.name)}
					onkeydown={keydown}
				/>
			{/if}
		</div>
	{/each}
	{#if inspector && selected}
		<div class="inspector" class:above={selected.y > LOWEST_ROW_BELOW} style={beside(selected)}>{@render inspector()}</div>
	{/if}
</div>

<style>
	.board {
		position: relative;
		z-index: 2;
		width: 100%;
		aspect-ratio: 15 / 5.1;
		container-type: inline-size;
		--inspector-width: 232px;
	}

	.inspector {
		position: absolute;
		z-index: 5;
		width: var(--inspector-width);
		border-radius: 20px;
		background: var(--popover);
		padding: 6px;
		box-shadow: 0 12px 40px var(--shadow-soft);
		animation: open 160ms var(--ease);
	}

	.inspector.above {
		animation-name: open-above;
	}

	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}

	@keyframes open-above {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	.slot {
		position: absolute;
		padding: 0.28cqw;
	}

	.modifier {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: flex-end;
		border-radius: 0.9cqw;
		background: color-mix(in oklab, var(--control) 55%, transparent);
		padding: 0.7cqw 0.9cqw;
		overflow: hidden;
		white-space: nowrap;
		font-size: 1.05cqw;
		color: var(--text-muted);
		transition: background-color 140ms var(--ease);
	}

	.latch:hover {
		background: var(--control-hover);
	}

	.latch:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 0.16cqw var(--accent-line);
	}

	.modifier.pressed {
		background: var(--accent-soft);
		color: var(--text);
	}

	.enter .modifier {
		clip-path: polygon(0 0, 100% 0, 100% 100%, 16.7% 100%, 16.7% 50%, 0 50%);
		align-items: flex-start;
		padding-left: 1.6cqw;
	}
</style>
