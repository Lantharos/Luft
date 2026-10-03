<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { tooltip } from '@luft/ui';
	import { pairProblems, typeable } from '../issues';
	import type { LayoutEditor } from '../editor.svelte';
	import { standardName } from './table';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let characters = $derived(typeable(editor.layout));
</script>

{#snippet item(keysym: string, symbol: string, name: string, problem: boolean)}
	<button type="button" class="item" class:active={editor.chosenDead === keysym} aria-current={editor.chosenDead === keysym ? 'true' : undefined} onclick={() => (editor.chosenDead = keysym)}>
		<span class="glyph">{symbol}</span>
		<span class="min-w-0 flex-1 truncate">{name}</span>
		{#if problem}
			<span class="problem" role="img" aria-label="Has results to look at" {@attach tooltip('Has results to look at')}></span>
		{/if}
	</button>
{/snippet}

<nav class="flex flex-col gap-0.5" aria-label="Dead keys">
	{#each editor.layout.dead as key (key.keysym)}
		{@render item(key.keysym, key.symbol, key.name, pairProblems(key, characters).size > 0)}
	{/each}
	<button type="button" class="item add" onclick={() => void editor.addDead()}>
		<span class="glyph"><Plus size={16} /></span>
		<span>New dead key</span>
	</button>
	{#if editor.systemDead.length}
		<h3 class="px-3 pt-4 pb-1 text-[13px] font-medium text-[var(--text-muted)]">Standard</h3>
		{#each editor.systemDead as symbol (symbol.keysym)}
			{@render item(symbol.keysym, symbol.text, standardName(symbol.keysym), false)}
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

	.problem {
		height: 7px;
		width: 7px;
		flex: none;
		border-radius: var(--radius-pill);
		background: var(--danger);
	}
</style>
