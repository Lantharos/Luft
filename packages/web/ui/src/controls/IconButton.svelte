<script lang="ts">
	import type { Component } from 'svelte';
	import { tooltip } from '../menus/tooltip';

	interface Props {
		icon: Component;
		label: string;
		disabled?: boolean;
		onclick: () => void;
	}

	let { icon: Icon, label, disabled = false, onclick }: Props = $props();
</script>

<button type="button" class="icon-button" aria-label={label} {@attach tooltip(label)} {disabled} {onclick}>
	<Icon size={18} />
</button>
