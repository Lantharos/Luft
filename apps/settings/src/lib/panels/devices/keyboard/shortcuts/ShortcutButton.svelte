<script lang="ts">
	import Keys from './Keys.svelte';

	interface Props {
		accelerators: string[];
		label: string;
		onclick: () => void;
	}

	let { accelerators, label, onclick }: Props = $props();
</script>

<button type="button" class="shortcut" aria-label="Change shortcut for {label}" {onclick}>
	<Keys {accelerators} />
</button>

<style>
	.shortcut {
		display: inline-flex;
		min-height: 34px;
		align-items: center;
		border-radius: 12px;
		padding: 4px 6px;
		transition: background-color 160ms var(--ease);
	}

	.shortcut:hover {
		background: var(--surface-hover);
	}
</style>
