<script lang="ts" generics="T extends string">
	import { tooltip } from '@luft/ui';

	interface Option {
		value: T;
		label: string;
		color: string;
	}

	interface Props {
		options: Option[];
		value: T;
		label: string;
		onchange: (value: T) => void;
	}

	let { options, value, label, onchange }: Props = $props();
</script>

<div class="flex gap-1.5" role="radiogroup" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			class="swatch"
			class:selected={option.value === value}
			aria-checked={option.value === value}
			aria-label={option.label}
			style:background={option.color}
			onclick={() => onchange(option.value)}
			{@attach tooltip(option.label)}
		></button>
	{/each}
</div>

<style>
	.swatch {
		height: 24px;
		width: 24px;
		border-radius: 999px;
		box-shadow: inset 0 0 0 1px var(--hairline);
		transition: box-shadow 180ms var(--ease);
	}

	.swatch.selected {
		box-shadow:
			inset 0 0 0 1px var(--hairline),
			0 0 0 2px var(--content),
			0 0 0 4px var(--text);
	}
</style>
