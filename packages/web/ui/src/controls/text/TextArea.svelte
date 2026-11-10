<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value' | 'class' | 'children'> {
		value?: string;
		label: string;
		rows?: number;
		large?: boolean;
		element?: HTMLTextAreaElement;
		overlay?: Snippet;
		trailing?: Snippet;
	}

	let { value = $bindable(''), label, rows = 3, large = false, element = $bindable(), overlay, trailing, ...rest }: Props = $props();
</script>

<div class="text-area" class:large class:padded={trailing}>
	{#if overlay}
		<div class="text overlay" aria-hidden="true">{@render overlay()}</div>
	{/if}
	<textarea bind:this={element} bind:value class="text" {rows} spellcheck="false" autocomplete="off" aria-label={label} {...rest}></textarea>
	{#if trailing}
		<div class="trailing">{@render trailing()}</div>
	{/if}
</div>

<style>
	.text-area {
		position: relative;
		border-radius: 18px;
		background: var(--control);
		box-shadow: inset 0 0 0 1px var(--control-edge);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.text-area:hover {
		background: var(--control-hover);
	}

	.text-area:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--control-focus);
	}

	.text-area:has(textarea:disabled) {
		opacity: 0.4;
	}

	.text {
		padding: 9px 14px;
		font-size: 13px;
		line-height: 1.5;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.large .text {
		padding: 12px 16px;
		font-size: 17px;
	}

	.padded .text {
		padding-right: 44px;
	}

	textarea {
		position: relative;
		display: block;
		width: 100%;
		resize: none;
		background: transparent;
		color: var(--text);
		outline: none;
		scrollbar-width: none;
	}

	textarea::placeholder {
		color: var(--text-muted);
	}

	.overlay {
		position: absolute;
		inset: 0;
		overflow: hidden;
		color: transparent;
		pointer-events: none;
	}

	.trailing {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
	}

	.large .trailing {
		top: 9px;
		right: 9px;
	}
</style>
