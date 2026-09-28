<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	interface Props {
		value: string;
		label: string;
	}

	let { value = $bindable(), label }: Props = $props();
</script>

<label class="search">
	<Search size={16} class="icon" />
	<input class="text-field" type="search" placeholder={label} aria-label={label} bind:value />
</label>

<style>
	.search {
		position: relative;
		display: block;
	}

	.search :global(.icon) {
		position: absolute;
		top: 50%;
		left: 14px;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}

	input {
		padding-left: 38px;
	}

	input::-webkit-search-cancel-button {
		appearance: none;
	}
</style>
