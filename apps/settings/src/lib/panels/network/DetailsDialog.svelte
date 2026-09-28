<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import type { DetailRow } from './describe';

	interface Props {
		title: string;
		description?: string;
		rows: DetailRow[];
		onclose: () => void;
		actions: Snippet;
	}

	let { title, description, rows, onclose, actions }: Props = $props();
</script>

<Dialog {title} {description} {onclose} {actions}>
	{#if rows.length}
		<dl class="details">
			{#each rows as [label, value] (label)}
				<dt>{label}</dt>
				<dd>{value}</dd>
			{/each}
		</dl>
	{/if}
</Dialog>

<style>
	.details {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 10px 20px;
		font-size: 13px;
	}

	dt {
		color: var(--text-muted);
	}

	dd {
		overflow-wrap: anywhere;
		white-space: pre-line;
		text-align: right;
		color: var(--text);
		user-select: text;
	}
</style>
