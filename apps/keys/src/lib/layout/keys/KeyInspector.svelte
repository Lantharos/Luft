<script lang="ts">
	import PenLine from '@lucide/svelte/icons/pen-line';
	import { tooltip } from '@luft/ui';
	import { describe, LEVEL_NAMES, LEVEL_SHORT_NAMES, shown } from '#lib/keyboard/describe.js';
	import { describeText, EMPTY, type Symbol } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import SymbolPicker from './SymbolPicker.svelte';

	interface Props {
		editor: LayoutEditor;
		onescape: () => void;
	}

	let { editor, onescape }: Props = $props();

	const ARRANGED = [1, 3, 0, 2];

	let slots = $state<HTMLButtonElement[]>([]);
	let picking = $state<number | null>(null);
	let names = $state<string[]>(['', '', '', '']);

	let levels = $derived(editor.levels(editor.selected));

	$effect(() => {
		const current = levels;
		const dead = editor.layout.dead;
		void Promise.all(current.map((symbol) => describe(symbol, dead))).then((described) => {
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

	function open(level: number) {
		editor.level = level;
		if (editor.placing) editor.place(editor.placing, editor.selected, level);
		else picking = level;
	}

	function editDead(symbol: Symbol) {
		editor.chosenDead = symbol.keysym;
		editor.tab = 'dead';
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

<div class="grid grid-cols-2 gap-1" role="group" aria-label="What the key types">
	{#each ARRANGED as level (level)}
		{@const symbol = levels[level]}
		<div class="slot" class:current={editor.level === level} class:placing={editor.placing}>
			<button
				bind:this={slots[level]}
				type="button"
				class="pick"
				aria-label="{LEVEL_NAMES[level]}: {names[level]}"
				{@attach tooltip(names[level] ? `${LEVEL_NAMES[level]}: ${names[level]}` : LEVEL_NAMES[level])}
				onclick={() => open(level)}
				onkeydown={(event) => void keydown(event, level)}
			>
				<span class="level">{LEVEL_SHORT_NAMES[level]}</span>
				<span class="glyph" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
			</button>
			{#if symbol.kind === 'dead' && editor.dead(symbol.keysym)}
				<button type="button" class="edit" aria-label="Edit {names[level]}" {@attach tooltip('Edit dead key')} onclick={() => editDead(symbol)}><PenLine size={13} /></button>
			{/if}
		</div>
	{/each}
</div>

{#if picking !== null && slots[picking]}
	{@const level = picking}
	<SymbolPicker {editor} anchor={slots[level]} onpick={(symbol) => pick(level, symbol)} onclose={() => (picking = null)} />
{/if}

<style>
	.slot {
		position: relative;
		min-width: 0;
		border-radius: 14px;
		transition: background-color 140ms var(--ease);
	}

	.slot:hover {
		background: var(--surface-hover);
	}

	.slot.placing {
		box-shadow: inset 0 0 0 1px var(--accent-line);
	}

	.pick {
		display: flex;
		height: 64px;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		justify-content: space-between;
		border-radius: 14px;
		padding: 8px 10px;
		text-align: left;
		outline: none;
	}

	.pick:focus-visible,
	.current .pick:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.level {
		font-size: 11.5px;
		color: var(--text-muted);
	}

	.current .level {
		color: var(--text-soft);
	}

	.glyph {
		height: 28px;
		overflow: hidden;
		font-size: 24px;
		line-height: 28px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.dead {
		color: var(--secondary);
	}

	.named {
		font-size: 13px;
	}

	.edit {
		position: absolute;
		top: 6px;
		right: 6px;
		display: grid;
		height: 24px;
		width: 24px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition:
			background-color 140ms var(--ease),
			color 140ms var(--ease);
	}

	.edit:hover {
		background: var(--control);
		color: var(--text);
	}
</style>
