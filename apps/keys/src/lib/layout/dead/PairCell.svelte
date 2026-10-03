<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import type { DeadKey, Pair } from '../api';
	import type { LayoutEditor } from '../editor.svelte';

	interface Props {
		editor?: LayoutEditor;
		key: DeadKey;
		pair: Pair;
		index: number;
		problem?: string;
		readonly: boolean;
	}

	let { editor, key, pair, index, problem, readonly }: Props = $props();

	let next = $derived(pair.next ? editor?.dead(pair.next) : undefined);
	let others = $derived(editor?.layout.dead.filter((other) => other.keysym !== key.keysym) ?? []);

	function lastCharacter(value: string) {
		return [...value].slice(-1).join('');
	}

	function setBase(event: Event & { currentTarget: HTMLInputElement }) {
		const base = lastCharacter(event.currentTarget.value);
		event.currentTarget.value = base;
		editor?.updatePair(key.keysym, index, { base });
	}
</script>

<div class="cell" class:problem data-index={index} {@attach problem ? tooltip(problem) : undefined}>
	{#if readonly}
		<span class="base">{pair.base}</span>
		<ArrowRight size={14} class="flex-none text-[var(--text-muted)]" />
		<span class="result truncate">{pair.text}</span>
	{:else}
		<input class="base" value={pair.base} spellcheck="false" aria-label="Key" placeholder="a" oninput={setBase} />
		<ArrowRight size={14} class="flex-none text-[var(--text-muted)]" />
		{#if next}
			<span class="result chained truncate" title="Leads into {next.name}">{next.symbol} {next.name}</span>
		{:else}
			<input
				class="result"
				value={pair.text}
				spellcheck="false"
				aria-label="Makes"
				placeholder="ž"
				oninput={(event) => editor?.updatePair(key.keysym, index, { text: event.currentTarget.value })}
			/>
		{/if}
		<MenuButton label="Options" class="more" align="end" minWidth={220}>
			{#snippet trigger()}
				<Ellipsis size={15} />
			{/snippet}
			{#snippet children(close)}
				{#each others as other (other.keysym)}
					<MenuItem
						checked={pair.next === other.keysym}
						onclick={() => {
							close();
							editor?.updatePair(key.keysym, index, { next: other.keysym, text: '' });
						}}>Lead into {other.name}</MenuItem
					>
				{/each}
				{#if next}
					<MenuItem
						onclick={() => {
							close();
							editor?.updatePair(key.keysym, index, { next: undefined });
						}}>Make text instead</MenuItem
					>
				{/if}
				{#if others.length || next}
					<MenuSeparator />
				{/if}
				<MenuItem
					danger
					onclick={() => {
						close();
						editor?.removePair(key.keysym, index);
					}}>Remove</MenuItem
				>
			{/snippet}
		</MenuButton>
	{/if}
</div>

<style>
	.cell {
		display: flex;
		height: 100%;
		min-width: 0;
		align-items: center;
		gap: 6px;
		border-radius: 14px;
		background: var(--surface);
		padding-inline: 6px;
		transition:
			background-color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}

	.cell:hover,
	.cell:focus-within {
		background: var(--surface-hover);
	}

	.cell.problem {
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--danger) 55%, transparent);
	}

	.base,
	.result {
		height: 34px;
		min-width: 0;
		border-radius: 10px;
		background: transparent;
		font-size: 17px;
		line-height: 34px;
		color: var(--text);
		outline: none;
	}

	.base {
		width: 34px;
		flex: none;
		text-align: center;
	}

	.result {
		flex: 1;
		padding-inline: 6px;
	}

	input:focus {
		background: var(--control);
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	input::placeholder {
		color: color-mix(in oklab, var(--text-muted) 50%, transparent);
	}

	.chained {
		font-size: 13px;
		color: var(--secondary);
	}

	.cell :global(.more) {
		display: grid;
		height: 28px;
		width: 28px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		opacity: 0;
		transition:
			opacity 120ms var(--ease),
			background-color 120ms var(--ease);
	}

	.cell:hover :global(.more),
	.cell:focus-within :global(.more),
	.cell :global(.more[aria-expanded='true']) {
		opacity: 1;
	}

	.cell :global(.more:hover) {
		background: var(--control);
		color: var(--text);
	}
</style>
