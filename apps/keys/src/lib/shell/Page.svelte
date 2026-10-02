<script lang="ts">
	import type { Snippet } from 'svelte';
	import { WindowControls } from '@luft/ui';

	interface Props {
		title: string;
		wide?: boolean;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, wide = false, actions, children }: Props = $props();
</script>

<main class="glass-content">
	<header class="drag-region flex h-[60px] flex-none items-center gap-2 pr-4 pl-8">
		<h1 class="min-w-0 flex-1 truncate text-[20px] font-semibold">{title}</h1>
		{#if actions}
			<div class="mr-2 flex items-center gap-1.5">{@render actions()}</div>
		{/if}
		<WindowControls />
	</header>
	<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
		<div class="mx-auto flex w-full flex-col gap-7 px-8 pt-2 pb-10 {wide ? 'max-w-[1180px]' : 'max-w-[920px]'}">
			{@render children()}
		</div>
	</div>
</main>
