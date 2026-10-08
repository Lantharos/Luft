<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { appearance } from '../appearance.svelte';
	import TextMenu from '../menus/TextMenu.svelte';

	interface Props {
		class?: ClassValue;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div
	class={['glass-shell', className]}
	data-effect={appearance.translucent ? 'translucent' : 'solid'}
>
	{@render children()}
</div>

<TextMenu />
