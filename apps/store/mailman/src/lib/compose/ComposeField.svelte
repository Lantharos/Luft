<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		note?: string;
		children: Snippet;
	}

	let { label, note, children }: Props = $props();
</script>

<div class="field">
	<span class="label" aria-hidden="true">{label}</span>
	<div class="value">{@render children()}</div>
	{#if note}<p class="note" role="status">{note}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		min-height: 42px;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
		align-items: center;
		padding-inline: 18px 12px;
		box-shadow: inset 0 -1px 0 var(--hairline);
	}

	.label {
		justify-self: end;
		font-size: 13px;
		color: var(--text-muted);
	}

	.note {
		grid-column: 2;
		margin-top: -4px;
		padding-bottom: 9px;
		font-size: 12px;
		color: var(--text-muted);
	}

	.value {
		position: relative;
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 8px;
	}
</style>
