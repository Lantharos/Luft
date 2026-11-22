<script lang="ts" generics="Entry">
	import { untrack, type Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { PageMotion, providePageMotion } from './motion';

	interface Props {
		entries: Entry[];
		key: (entry: Entry, index: number) => string;
		order?: number;
		class?: ClassValue;
		children: Snippet<[Entry]>;
	}

	let { entries, key, order = 0, class: className, children }: Props = $props();

	const motion = providePageMotion(new PageMotion());

	let top = $derived(entries.length - 1);

	$effect.pre(() => {
		void key(entries[top], top);
		untrack(() => motion.arrive({ order, depth: top }));
	});
</script>

<div class="page-stage">
	<div class="page-stage-ghosts" {@attach motion.layer}></div>
	{#each entries as entry, index (key(entry, index))}
		<div class={['page-stage-page', className]} hidden={index !== top} {@attach index === top ? motion.page : undefined}>{@render children(entry)}</div>
	{/each}
</div>
