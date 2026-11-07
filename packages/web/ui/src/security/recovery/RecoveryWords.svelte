<script lang="ts">
	import { keyWords } from './words';

	interface Props {
		key: string;
		label: string;
	}

	let { key, label }: Props = $props();

	const words = $derived(keyWords(key));
	const groups = $derived(key.toUpperCase().split('-'));
</script>

{#if words}
	<ol class="words" aria-label={label}>
		{#each words as word, index (index)}
			<li><span class="number">{index + 1}</span>{word}</li>
		{/each}
	</ol>
{:else}
	<div class="letters" aria-label={label}>
		{#each groups as group, index (index)}
			<span>{group}</span>
		{/each}
	</div>
{/if}

<style>
	.words,
	.letters {
		display: grid;
		padding: 18px 20px;
		border-radius: 16px;
		background: var(--surface);
		color: var(--text);
		user-select: all;
	}

	.words {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px 16px;
		font-size: 16px;
	}

	.words li {
		display: flex;
		align-items: baseline;
		gap: 10px;
		min-width: 0;
	}

	.number {
		width: 18px;
		flex: none;
		text-align: right;
		font-size: 12.5px;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		user-select: none;
	}

	.letters {
		grid-template-columns: repeat(4, auto);
		justify-content: center;
		gap: 10px 18px;
		font-family: var(--font-mono);
		font-size: 17px;
		letter-spacing: 0.04em;
	}
</style>
