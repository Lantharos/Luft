<script lang="ts" generics="T extends string | number">
	import type { Snippet } from 'svelte';

	interface Option {
		value: T;
		label: string;
	}

	interface Props {
		options: Option[];
		value: T;
		label: string;
		onchange: (value: T) => void;
		item?: Snippet<[Option]>;
	}

	let { options, value, label, onchange, item }: Props = $props();
	let index = $derived(Math.max(0, options.findIndex((option) => option.value === value)));
</script>

<div class="segmented" class:compact={item} role="radiogroup" aria-label={label} style:--count={options.length} style:--index={index}>
	<span class="indicator"></span>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={option.value === value}
			aria-label={item ? option.label : undefined}
			class:active={option.value === value}
			onclick={() => onchange(option.value)}
		>
			{#if item}
				{@render item(option)}
			{:else}
				{option.label}
			{/if}
		</button>
	{/each}
</div>

<style>
	.segmented {
		position: relative;
		display: grid;
		grid-template-columns: repeat(var(--count), minmax(0, 1fr));
		padding: 3px;
		border-radius: var(--radius-pill);
		background: var(--control);
	}

	.indicator {
		position: absolute;
		top: 3px;
		bottom: 3px;
		left: 3px;
		width: calc((100% - 6px) / var(--count));
		transform: translateX(calc(100% * var(--index)));
		border-radius: var(--radius-pill);
		background: var(--control-hover);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		transition: transform 240ms var(--ease);
	}

	button {
		position: relative;
		min-height: 30px;
		padding-inline: 14px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		transition: color 180ms var(--ease);
	}

	.compact button {
		display: grid;
		min-height: 28px;
		place-items: center;
		padding-inline: 9px;
	}

	button.active,
	button:hover {
		color: var(--text);
	}
</style>
