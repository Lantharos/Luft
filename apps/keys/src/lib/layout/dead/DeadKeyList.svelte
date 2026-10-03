<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { pairProblems, typeable } from '../issues';
	import type { LayoutEditor } from '../editor.svelte';
	import { standardName } from './table';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let characters = $derived(typeable(editor.layout));
</script>

{#snippet item(keysym: string, symbol: string, name: string, trailing: string, problem: boolean)}
	<button type="button" class="item" class:active={editor.chosenDead === keysym} aria-current={editor.chosenDead === keysym ? 'true' : undefined} onclick={() => (editor.chosenDead = keysym)}>
		<span class="glyph">{symbol}</span>
		<span class="min-w-0 flex-1 truncate">{name}</span>
		<span class="trailing" class:problem>{trailing}</span>
	</button>
{/snippet}

<nav class="flex flex-col gap-0.5" aria-label="Dead keys">
	{#each editor.layout.dead as key (key.keysym)}
		{@render item(key.keysym, key.symbol, key.name, String(key.pairs.length), pairProblems(key, characters).size > 0)}
	{/each}
	<button type="button" class="item add" onclick={() => void editor.addDead()}>
		<span class="glyph"><Plus size={16} /></span>
		<span>New dead key</span>
	</button>
	{#if editor.systemDead.length}
		<h3 class="px-3 pt-5 pb-1 text-[13px] font-medium text-[var(--text-muted)]">Standard</h3>
		{#each editor.systemDead as symbol (symbol.keysym)}
			{@render item(symbol.keysym, symbol.text, standardName(symbol.keysym), '', false)}
		{/each}
	{/if}
</nav>

<style>
	.item {
		display: flex;
		height: 38px;
		width: 100%;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 8px 14px;
		text-align: left;
		font-size: 14px;
		color: var(--text-soft);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease);
	}

	.item:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.item.active {
		background: color-mix(in oklab, var(--ink) 9%, transparent);
		color: var(--text);
		font-weight: 500;
	}

	.add {
		color: var(--text-muted);
	}

	.glyph {
		display: grid;
		width: 26px;
		flex: none;
		place-items: center;
		font-size: 17px;
		font-weight: 400;
		color: var(--secondary);
	}

	.add .glyph {
		color: inherit;
	}

	.trailing {
		flex: none;
		font-size: 12.5px;
		font-weight: 400;
		color: var(--text-muted);
	}

	.trailing.problem {
		color: var(--danger);
	}
</style>
