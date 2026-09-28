<script lang="ts" generics="T extends string | number">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Popover from '../menus/Popover.svelte';

	interface Option {
		value: T;
		label: string;
	}

	interface Props {
		options: Option[];
		value: T;
		label: string;
		placeholder?: string;
		disabled?: boolean;
		onchange: (value: T) => void;
	}

	const MIN_WIDTH = 200;

	let { options, value, label, placeholder = 'Choose', disabled = false, onchange }: Props = $props();

	let trigger = $state<HTMLButtonElement>();
	let open = $state(false);
	let highlighted = $state(0);

	let selected = $derived(options.find((option) => option.value === value));

	function show() {
		if (disabled || !options.length) return;
		highlighted = Math.max(0, options.findIndex((option) => option.value === value));
		open = true;
	}

	function choose(option: Option) {
		open = false;
		trigger?.focus();
		if (option.value !== value) onchange(option.value);
	}

	function keydown(event: KeyboardEvent) {
		if (!open) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
				event.preventDefault();
				show();
			}
			return;
		}
		if (event.key === 'Escape') {
			open = false;
		} else if (event.key === 'ArrowDown') {
			highlighted = (highlighted + 1) % options.length;
		} else if (event.key === 'ArrowUp') {
			highlighted = (highlighted - 1 + options.length) % options.length;
		} else if (event.key === 'Enter' || event.key === ' ') {
			choose(options[highlighted]);
		} else {
			return;
		}
		event.preventDefault();
	}
</script>

<button
	bind:this={trigger}
	type="button"
	class="trigger"
	class:open
	aria-haspopup="listbox"
	aria-expanded={open}
	aria-label={label}
	{disabled}
	onclick={() => (open ? (open = false) : show())}
	onkeydown={keydown}
>
	<span class="truncate">{selected?.label ?? placeholder}</span>
	<ChevronDown size={16} class="chevron" />
</button>

{#if open && trigger}
	<Popover anchor={trigger} {label} role="listbox" minWidth={MIN_WIDTH} onclose={() => (open = false)}>
		{#each options as option, index (option.value)}
			<button
				type="button"
				role="option"
				aria-selected={option.value === value}
				class="option"
				class:highlighted={index === highlighted}
				onpointerenter={() => (highlighted = index)}
				onclick={() => choose(option)}
			>
				<span class="truncate">{option.label}</span>
				{#if option.value === value}
					<Check size={16} />
				{/if}
			</button>
		{/each}
	</Popover>
{/if}

<style>
	.trigger {
		display: inline-flex;
		height: 36px;
		max-width: 280px;
		min-width: 140px;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding-inline: 14px 12px;
		font-size: 13px;
		font-weight: 500;
		transition: background-color 160ms var(--ease);
	}

	.trigger:hover:not(:disabled),
	.trigger.open {
		background: var(--control-hover);
	}

	.trigger:disabled {
		opacity: 0.4;
	}

	.trigger :global(.chevron) {
		flex: none;
		color: var(--text-muted);
		transition: transform 200ms var(--ease);
	}

	.trigger.open :global(.chevron) {
		transform: rotate(180deg);
	}

	.option {
		display: flex;
		min-height: 34px;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 10px;
		text-align: left;
		font-size: 13px;
		color: var(--text-soft);
	}

	.option.highlighted {
		background: var(--surface-hover);
		color: var(--text);
	}

	.option[aria-selected='true'] {
		color: var(--text);
	}
</style>
