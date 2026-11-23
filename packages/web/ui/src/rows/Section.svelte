<script lang="ts">
	import type { Snippet } from 'svelte';
	import { listMotion } from '../motion/lists';

	interface Props {
		title?: string;
		description?: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<section class="flex flex-col">
	{#if title}
		<h2 class="title">{title}</h2>
	{/if}
	{#if description}
		<p class="description">{description}</p>
	{/if}
	<div class="row-group" {@attach listMotion}>{@render children()}</div>
</section>

<style>
	.title {
		overflow: hidden;
		padding: 0 8px 10px;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}

	.description {
		padding: 0 6px 10px;
		margin-top: -4px;
		font-size: 13px;
		color: var(--text-quiet);
	}
</style>
