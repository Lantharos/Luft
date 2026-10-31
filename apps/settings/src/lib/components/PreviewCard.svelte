<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		description?: string;
		selected: boolean;
		onclick: () => void;
		children: Snippet;
	}

	let { label, description, selected, onclick, children }: Props = $props();
</script>

<button type="button" role="radio" class="card" class:selected aria-checked={selected} {onclick}>
	<span class="frame">{@render children()}</span>
	<span class="label">{label}</span>
	{#if description}
		<span class="description">{description}</span>
	{/if}
</button>

<style>
	.card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 4px;
		border-radius: 18px;
		padding: 10px 10px 14px;
		text-align: left;
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.card:hover {
		background: var(--surface-hover);
	}

	.card:active {
		transform: scale(0.985);
	}

	.frame {
		display: block;
		margin-bottom: 8px;
		border-radius: 12px;
		box-shadow: 0 0 0 2px transparent;
		transition: box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.selected .frame {
		box-shadow: 0 0 0 2px var(--accent);
	}

	.label {
		padding: 0 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
	}

	.description {
		padding: 0 4px;
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--text-muted);
	}
</style>
