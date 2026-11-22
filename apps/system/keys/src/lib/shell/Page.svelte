<script lang="ts">
	import type { Snippet } from 'svelte';
	import { TitleBar } from '@luft/ui';

	interface Props {
		title: string;
		wide?: boolean;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, wide = false, actions, children }: Props = $props();
</script>

<TitleBar {title} {actions} />
<div class="min-h-0 flex-1 overflow-y-auto">
	<div class="mx-auto flex w-full flex-col gap-7 px-8 pt-2 pb-10 {wide ? 'max-w-[1180px]' : 'max-w-[920px]'}">
		{@render children()}
	</div>
</div>
