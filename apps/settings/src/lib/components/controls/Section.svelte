<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		description?: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<section class="flex flex-col">
	{#if title}
		<h2 class="section-title">{title}</h2>
	{/if}
	{#if description}
		<p class="section-description">{description}</p>
	{/if}
	<div class="group">{@render children()}</div>
</section>
