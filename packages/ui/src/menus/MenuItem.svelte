<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		danger?: boolean;
		disabled?: boolean;
		checked?: boolean;
		onclick: () => void;
		children: Snippet;
	}

	let { danger = false, disabled = false, checked, onclick, children }: Props = $props();
</script>

<button
	type="button"
	role={checked === undefined ? 'menuitem' : 'menuitemradio'}
	aria-checked={checked}
	class="menu-item"
	class:danger
	{disabled}
	{onclick}
>
	{@render children()}
</button>

<style>
	.menu-item {
		display: flex;
		min-height: 38px;
		width: 100%;
		flex: none;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 10px;
		text-align: left;
		font-size: 13px;
		color: var(--text-soft);
		transition-property: background-color, color, transform, opacity;
		transition-duration: 210ms;
		transition-timing-function: var(--ease);
	}

	.menu-item:hover:not(:disabled),
	.menu-item[aria-checked='true'] {
		color: var(--text);
	}

	.menu-item:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.menu-item.danger,
	.menu-item.danger:hover:not(:disabled) {
		color: var(--danger);
	}

	.menu-item:active:not(:disabled) {
		transform: scale(0.96);
	}

	.menu-item:disabled {
		opacity: 0.35;
	}
</style>
