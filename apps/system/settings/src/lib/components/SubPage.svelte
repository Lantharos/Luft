<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { pageMotion } from './stage/motion';

	interface Props {
		title: string;
		onclose: () => void;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, onclose, actions, children }: Props = $props();

	let root = $state<HTMLDivElement>();

	const motion = pageMotion();
	untrack(() => motion.open(title));

	export function reveal() {
		root?.scrollIntoView({ block: 'start' });
	}

	function leave(node: HTMLElement) {
		motion.close(node);
		return { duration: 0 };
	}

	$effect(() =>
		app.showPage({
			title,
			actions,
			close: () => onclose()
		})
	);
</script>

<div bind:this={root} class="flex scroll-mt-4 flex-col gap-7" out:leave|global>
	{@render children()}
</div>
