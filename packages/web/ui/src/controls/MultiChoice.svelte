<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value: string[];
		label: string;
		least?: number;
		onchange: (value: string[]) => void;
	}

	let { options, value, label, least = 0, onchange }: Props = $props();

	const toggle = (option: string) => onchange(value.includes(option) ? value.filter((other) => other !== option) : [...value, option]);
</script>

<div class="choices" role="group" aria-label={label}>
	{#each options as option (option.value)}
		{@const picked = value.includes(option.value)}
		{@const kept = picked && value.length <= least}
		<button type="button" aria-pressed={picked} aria-disabled={kept} class:picked onclick={() => !kept && toggle(option.value)}>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.choices {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		padding: 3px;
		border-radius: var(--radius-pill);
		background: var(--control);
	}

	button {
		min-height: 30px;
		padding-inline: 14px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		transition:
			color var(--motion-tap) var(--ease-decelerate),
			background var(--motion-tap) var(--ease-decelerate);
	}

	button:hover {
		color: var(--text);
	}

	button.picked {
		background: var(--control-hover);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		color: var(--text);
	}

	button[aria-disabled='true'] {
		cursor: default;
	}
</style>
