<script lang="ts">
	import type { Levels, Symbol } from '#lib/layout/api.js';
	import { typedLevel } from './board';

	interface Props {
		levels: Levels;
		level: number | null;
		layer: number | null;
		selected: boolean;
		pressed: boolean;
		onselect: () => void;
		onkeydown: (event: KeyboardEvent) => void;
	}

	let { levels, level, layer, selected, pressed, onselect, onkeydown }: Props = $props();

	let [base, shift] = $derived(levels);
	let capital = $derived(base.kind === 'character' && shift.kind === 'character' && shift.text !== base.text && base.text.toUpperCase() === shift.text);

	let typed = $derived(level === null ? null : typedLevel(levels, level));
	let layered = $derived(layer === null ? null : typedLevel(levels, layer));

	function emphasis(...shownLevels: number[]) {
		if (typed === null) return '';
		return shownLevels.includes(typed) ? 'lit' : 'faded';
	}

	function shown(symbol: Symbol) {
		return symbol.kind === 'compose' ? '⎄' : symbol.text;
	}
</script>

{#snippet glyph(index: number, place: string)}
	{@const symbol = levels[index]}
	{#if symbol.kind !== 'empty'}
		<span class="glyph {place} {emphasis(index)}" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
	{/if}
{/snippet}

<button type="button" class="cap" class:selected class:pressed aria-pressed={selected} tabindex={selected ? 0 : -1} onclick={onselect} {onkeydown}>
	{#if layer !== null && layered !== null}
		{@const symbol = levels[layered]}
		{#if symbol.kind !== 'empty'}
			<span class="glyph single" class:inherited={layered !== layer} class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
		{/if}
	{:else}
		{#if capital}
			<span class="glyph capital {emphasis(0, 1)}">{shift.text}</span>
		{:else}
			{@render glyph(1, 'top-left')}
			{@render glyph(0, 'bottom-left')}
		{/if}
		{@render glyph(3, 'top-right')}
		{@render glyph(2, 'bottom-right')}
	{/if}
</button>

<style>
	.cap {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 0.9cqw;
		background: var(--control);
		color: var(--text);
		box-shadow: 0 0.15cqw 0 color-mix(in oklab, var(--ink) 6%, transparent);
		transition:
			background-color 140ms var(--ease),
			box-shadow 140ms var(--ease),
			transform 120ms var(--ease);
	}

	.cap:hover {
		background: var(--control-hover);
	}

	.cap:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 0.16cqw var(--accent-line);
	}

	.cap.pressed {
		background: var(--accent-soft);
		transform: translateY(0.12cqw);
	}

	.cap.selected {
		box-shadow: inset 0 0 0 0.16cqw var(--accent);
	}

	.glyph {
		position: absolute;
		max-width: 46%;
		overflow: hidden;
		line-height: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 1.55cqw;
		transition:
			opacity 120ms var(--ease),
			color 120ms var(--ease);
	}

	.capital {
		top: 18%;
		left: 16%;
		font-size: 1.85cqw;
		font-weight: 500;
	}

	.top-left {
		top: 14%;
		left: 14%;
	}

	.bottom-left {
		bottom: 14%;
		left: 14%;
	}

	.top-right,
	.bottom-right {
		right: 14%;
		color: var(--tertiary);
		font-size: 1.3cqw;
	}

	.top-right {
		top: 14%;
	}

	.bottom-right {
		bottom: 14%;
	}

	.single {
		inset: 0;
		display: grid;
		max-width: none;
		place-items: center;
		font-size: 2.1cqw;
	}

	.single.named {
		font-size: 0.95cqw;
	}

	.inherited {
		opacity: 0.32;
	}

	.faded {
		opacity: 0.28;
	}

	.lit.top-right,
	.lit.bottom-right {
		color: var(--text);
	}

	.dead {
		color: var(--secondary);
	}

	.named {
		font-size: 0.85cqw;
		color: var(--text-muted);
	}
</style>
