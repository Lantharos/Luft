<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { onMount, type Snippet } from 'svelte';
	import { IconButton } from '@luft/ui';

	interface Props {
		title: string;
		back: string;
		onclose: () => void;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, back, onclose, actions, children }: Props = $props();

	let root = $state<HTMLDivElement>();

	export function reveal() {
		root?.scrollIntoView({ block: 'start' });
	}

	onMount(reveal);
</script>

<div bind:this={root} class="flex scroll-mt-4 flex-col gap-7">
	<div class="-mb-2 flex items-center gap-3">
		<IconButton icon={ArrowLeft} label="Back to {back}" onclick={onclose} />
		<h2 class="min-w-0 flex-1 truncate text-[17px] font-semibold">{title}</h2>
		{@render actions?.()}
	</div>
	{@render children()}
</div>
