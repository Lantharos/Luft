<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon: Component;
		label: string;
		onclick: () => void;
	}

	let { icon: Icon, label, onclick }: Props = $props();
</script>

<button type="button" class="icon-button" aria-label={label} title={label} {onclick}>
	<Icon size={18} />
</button>

<style>
	.icon-button {
		display: grid;
		height: 32px;
		width: 32px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition: background-color 160ms var(--ease), color 160ms var(--ease), transform 160ms var(--ease);
	}

	.icon-button:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.icon-button:active {
		transform: scale(0.94);
	}
</style>
