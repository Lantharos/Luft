<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon: Component;
		label: string;
		disabled?: boolean;
		onclick: () => void;
	}

	let { icon: Icon, label, disabled = false, onclick }: Props = $props();
</script>

<button type="button" class="icon-button" aria-label={label} title={label} {disabled} {onclick}>
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
		transition-property: background-color, color, opacity, transform;
		transition-duration: 160ms;
		transition-timing-function: var(--ease);
	}

	.icon-button:hover:not(:disabled) {
		background: var(--surface-hover);
		color: var(--text);
	}

	.icon-button:active:not(:disabled) {
		transform: scale(0.94);
	}

	.icon-button:disabled {
		opacity: 0.3;
	}
</style>
