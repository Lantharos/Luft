<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { Row } from '@luft/ui';

	interface Props {
		title: string;
		icon: Component;
		description: string;
		hint?: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { title, icon, description, hint, disabled = false, children }: Props = $props();

	let expanded = $state(false);
</script>

<Row {title} {icon} {description} {disabled} {expanded} onclick={() => (expanded = !expanded)} />
{#if expanded}
	{#if hint}
		<p class="pr-4 pb-2 pl-[50px] text-[12.5px] leading-[1.4] text-[var(--text-muted)]">{hint}</p>
	{/if}
	{@render children()}
{/if}
