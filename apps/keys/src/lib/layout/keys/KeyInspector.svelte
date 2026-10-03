<script lang="ts">
	import { describe, LEVEL_NAMES, shown } from '$lib/keyboard/describe';
	import { describeText, EMPTY, type Symbol } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
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

<div class="grid grid-cols-4 gap-2">
	{#each levels as symbol, level (level)}
		<div class="slot" class:current={editor.level === level} class:placing={editor.placing}>
			<button
				bind:this={slots[level]}
				type="button"
				class="pick"
				aria-label="{LEVEL_NAMES[level]}: {names[level]}"
				onclick={() => open(level)}
				onkeydown={(event) => void keydown(event, level)}
			>
				<span class="text-[12px] text-[var(--text-muted)]">{LEVEL_NAMES[level]}</span>
				<span class="glyph" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
				<span class="truncate text-[12px] text-[var(--text-soft)] first-letter:uppercase">{names[level]}</span>
			</button>
			{#if symbol.kind === 'dead' && editor.dead(symbol.keysym)}
				<button type="button" class="edit" onclick={() => editDead(symbol)}>Edit</button>
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
		border-radius: 16px;
		background: var(--surface);
		transition:
			background-color 140ms var(--ease),
			box-shadow 140ms var(--ease);
	}

	.slot:hover {
		background: var(--surface-hover);
	}

	.slot.placing {
		box-shadow: inset 0 0 0 1px var(--accent-line);
	}

	.pick {
		display: flex;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		gap: 6px;
		border-radius: 16px;
		padding: 12px 14px;
		text-align: left;
		outline: none;
	}

	.pick:focus-visible,
	.current .pick:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.edit {
		position: absolute;
		top: 8px;
		right: 8px;
		border-radius: var(--radius-pill);
		padding: 3px 10px;
		font-size: 12px;
		color: var(--text-soft);
		transition: background-color 140ms var(--ease);
	}

	.edit:hover {
		background: var(--control);
		color: var(--text);
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
