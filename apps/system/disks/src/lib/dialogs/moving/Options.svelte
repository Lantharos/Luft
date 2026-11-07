<script lang="ts" generics="Item">
	import Check from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		items: Item[];
		key: (item: Item) => string;
		chosen: string | null;
		disabled: (item: Item) => boolean;
		row: Snippet<[Item]>;
		onchoose: (item: Item) => void;
	}

	let { label, items, key, chosen, disabled, row, onchoose }: Props = $props();
</script>

<div class="row-group" role="radiogroup" aria-label={label}>
	{#each items as item (key(item))}
		<button
			type="button"
			role="radio"
			class="option"
			aria-checked={chosen === key(item)}
			disabled={disabled(item)}
			onclick={() => onchoose(item)}
		>
			<span class="flex min-w-0 flex-1 items-center gap-3">{@render row(item)}</span>
			{#if chosen === key(item)}
				<Check size={18} class="flex-none" />
			{/if}
		</button>
	{/each}
</div>

<style>
	.option {
		display: flex;
		width: 100%;
		min-height: 56px;
		align-items: center;
		gap: 12px;
		padding: 8px 16px;
		text-align: left;
		color: var(--text-soft);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.option:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.option[aria-checked='true'] {
		color: var(--text);
	}

	.option:disabled {
		color: var(--text-muted);
	}
</style>
