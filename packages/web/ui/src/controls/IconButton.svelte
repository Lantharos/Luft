<script lang="ts">
	import type { Component } from 'svelte';
	import { tooltip } from '../menus/tooltip';

	interface Props {
		icon: Component;
		label: string;
		disabled?: boolean;
		large?: boolean;
		onclick: () => void;
	}

	let { icon: Icon, label, disabled = false, large = false, onclick }: Props = $props();
</script>

<button type="button" class="icon-button" class:large aria-label={label} {@attach tooltip(label)} {disabled} {onclick}>
	<Icon size={large ? 22 : 18} />
</button>
