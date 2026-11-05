<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { app } from '#lib/state/app.svelte.js';

	interface Props {
		title: string;
		onclose: () => void;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, onclose, actions, children }: Props = $props();

	let root = $state<HTMLDivElement>();

	export function reveal() {
		root?.scrollIntoView({ block: 'start' });
	}

	$effect(() =>
		app.showPage({
			title,
			actions,
			close: () => onclose()
		})
	);

	onMount(reveal);
</script>

<div bind:this={root} class="flex scroll-mt-4 flex-col gap-7">
	{@render children()}
</div>
