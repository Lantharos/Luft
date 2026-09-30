<script lang="ts">
	import { WindowControls } from '@luft/ui';
	import type { Snippet } from 'svelte';
	import Preferences from './Preferences.svelte';

	interface Props {
		title: string;
		detail?: string | null;
		children?: Snippet;
	}

	let { title, detail, children }: Props = $props();
</script>

<header class="drag-region flex h-[60px] flex-none items-center gap-4 pr-4 pl-8">
	<div class="flex min-w-0 flex-1 items-baseline gap-3">
		<h1 class="flex-none text-[20px] font-semibold">{title}</h1>
		{#if detail}
			<span class="truncate text-[13px] text-[var(--text-muted)]">{detail}</span>
		{/if}
	</div>
	{@render children?.()}
	<Preferences />
	<WindowControls />
</header>
