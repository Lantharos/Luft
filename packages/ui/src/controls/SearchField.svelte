<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	interface Props {
		value: string;
		label: string;
		variant?: 'field' | 'sidebar';
		large?: boolean;
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let { value = $bindable(), label, variant = 'field', large = false, onkeydown }: Props = $props();

	let input = $state<HTMLInputElement>();

	export function focus() {
		input?.focus();
		input?.select();
	}
</script>

<label class="search {variant}" class:large data-no-drag>
	<Search size={large ? 17 : 16} class="icon" />
	<input bind:this={input} class:text-field={variant === 'field'} type="search" placeholder={label} aria-label={label} bind:value {onkeydown} />
</label>

<style>
	.search :global(.icon) {
		flex: none;
		pointer-events: none;
	}

	input::-webkit-search-cancel-button {
		display: none;
	}

	.field {
		position: relative;
		display: block;
	}

	.field :global(.icon) {
		position: absolute;
		top: 50%;
		left: 14px;
		transform: translateY(-50%);
		color: var(--text-muted);
	}

	.field input {
		padding-left: 38px;
	}

	.sidebar {
		display: flex;
		height: 38px;
		flex: none;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		background: var(--sidebar-control);
		padding-inline: 12px;
		transition: background-color 160ms var(--ease);
	}

	.sidebar:hover,
	.sidebar:focus-within {
		background: var(--sidebar-control-hover);
	}

	.sidebar.large {
		height: 44px;
		gap: 12px;
		padding-inline: 14px;
	}

	.sidebar :global(.icon) {
		color: var(--sidebar-text-muted);
	}

	.sidebar input {
		min-width: 0;
		flex: 1;
		background: transparent;
		font-size: 13px;
		outline: none;
		color: var(--sidebar-text);
	}

	.sidebar.large input {
		font-size: 15px;
	}

	.sidebar input::placeholder {
		color: var(--sidebar-text-muted);
	}
</style>
