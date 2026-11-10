<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		value: string;
		label: string;
		placeholder?: string;
		single?: boolean;
		large?: boolean;
		invalid?: boolean;
		disabled?: boolean;
		class?: ClassValue;
		oninput: (event: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let { value, label, placeholder, single = false, large = false, invalid = false, disabled = false, class: className, oninput }: Props = $props();
</script>

<input
	class={['text-cell', className]}
	class:single
	class:large
	class:invalid
	{value}
	{placeholder}
	{disabled}
	spellcheck="false"
	autocomplete="off"
	aria-label={label}
	aria-invalid={invalid}
	{oninput}
/>

<style>
	.text-cell {
		height: 34px;
		width: 100%;
		min-width: 0;
		flex: 1;
		border-radius: 10px;
		background: transparent;
		padding-inline: 8px;
		font-size: 14px;
		color: var(--text);
		outline: none;
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.text-cell:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.text-cell:focus {
		background: var(--control);
		box-shadow: inset 0 0 0 1.5px var(--control-focus);
	}

	.text-cell:disabled {
		opacity: 0.4;
	}

	.text-cell::placeholder {
		color: color-mix(in oklab, var(--text-muted) 55%, transparent);
	}

	.large {
		font-size: 17px;
	}

	.single {
		width: 34px;
		flex: none;
		padding-inline: 0;
		text-align: center;
	}

	.invalid {
		color: var(--danger);
	}
</style>
