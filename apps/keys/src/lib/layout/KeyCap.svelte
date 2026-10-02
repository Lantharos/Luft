<script lang="ts">
	import type { Levels, Symbol } from './api';

	interface Props {
		levels: Levels;
		selected: boolean;
		pressed: boolean;
		onselect: () => void;
		onkeydown: (event: KeyboardEvent) => void;
	}

	let { levels, selected, pressed, onselect, onkeydown }: Props = $props();

	let [base, shift, third, fourth] = $derived(levels);
	let capital = $derived(base.kind === 'character' && shift.kind === 'character' && shift.text !== base.text && base.text.toUpperCase() === shift.text);

	function shown(symbol: Symbol) {
		return symbol.kind === 'compose' ? '⎄' : symbol.text;
	}
</script>

{#snippet glyph(symbol: Symbol, place: string)}
	{#if symbol.kind !== 'empty'}
		<span class="glyph {place}" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
	{/if}
{/snippet}

<button type="button" class="cap" class:selected class:pressed aria-pressed={selected} onclick={onselect} {onkeydown}>
	{#if capital}
		<span class="glyph capital">{shift.text}</span>
	{:else}
		{@render glyph(shift, 'top-left')}
		{@render glyph(base, 'bottom-left')}
	{/if}
	{@render glyph(fourth, 'top-right')}
	{@render glyph(third, 'bottom-right')}
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

	.dead {
		color: var(--secondary);
	}

	.named {
		font-size: 0.85cqw;
		color: var(--text-muted);
	}
</style>
