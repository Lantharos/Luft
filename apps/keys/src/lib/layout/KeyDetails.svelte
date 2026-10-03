<script lang="ts">
	import { describe, LEVEL_NAMES, shown } from '$lib/keyboard/describe';
	import { describeText, EMPTY, type Symbol } from './api';
	import type { LayoutEditor } from './editor.svelte';
	import SymbolPicker from './SymbolPicker.svelte';

	interface Props {
		editor: LayoutEditor;
		onescape: () => void;
	}

	let { editor, onescape }: Props = $props();

	let slots = $state<HTMLButtonElement[]>([]);
	let picking = $state<number | null>(null);
	let names = $state<string[]>(['', '', '', '']);

	let levels = $derived(editor.levels(editor.selected));

	$effect(() => {
		const current = levels;
		void Promise.all(current.map(describe)).then((described) => {
			if (current === levels) names = described;
		});
	});

	export function focus() {
		slots[editor.level]?.focus();
	}

	function pick(level: number, symbol: Symbol) {
		editor.assign(symbol, editor.selected, level);
		picking = null;
		slots[level]?.focus();
	}

	async function keydown(event: KeyboardEvent, level: number) {
		editor.level = level;
		if (event.key === 'Escape') {
			event.preventDefault();
			onescape();
		} else if (event.key === 'Backspace' || event.key === 'Delete') {
			event.preventDefault();
			editor.assign(EMPTY, editor.selected, level);
		} else if ([...event.key].length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
			event.preventDefault();
			editor.assign(await describeText(event.key), editor.selected, level);
		}
	}
</script>

<div class="grid grid-cols-4 gap-2">
	{#each levels as symbol, level (level)}
		<button
			bind:this={slots[level]}
			type="button"
			class="slot"
			class:current={editor.level === level}
			aria-label="{LEVEL_NAMES[level]}: {names[level]}"
			onclick={() => {
				editor.level = level;
				picking = level;
			}}
			onkeydown={(event) => void keydown(event, level)}
		>
			<span class="text-[12px] text-[var(--text-muted)]">{LEVEL_NAMES[level]}</span>
			<span class="glyph" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
			<span class="truncate text-[12px] text-[var(--text-soft)] first-letter:uppercase">{names[level]}</span>
		</button>
	{/each}
</div>

{#if picking !== null && slots[picking]}
	{@const level = picking}
	<SymbolPicker anchor={slots[level]} onpick={(symbol) => pick(level, symbol)} onclose={() => (picking = null)} />
{/if}

<style>
	.slot {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 6px;
		border-radius: 16px;
		background: var(--surface);
		padding: 12px 14px;
		text-align: left;
		outline: none;
		transition:
			background-color 140ms var(--ease),
			box-shadow 140ms var(--ease);
	}

	.slot:hover {
		background: var(--surface-hover);
	}

	.slot:focus-visible,
	.slot.current:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.glyph {
		height: 38px;
		overflow: hidden;
		font-size: 30px;
		line-height: 38px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.dead {
		color: var(--secondary);
	}

	.named {
		font-size: 15px;
	}
</style>
