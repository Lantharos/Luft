<script lang="ts">
	import type { Snippet } from 'svelte';
	import Header from '#lib/shell/Header.svelte';

	interface Props {
		title: string;
		detail?: string | null;
		children: Snippet;
	}

	let { title, detail, children }: Props = $props();
</script>

<Header {title} {detail} />
<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-8 pt-2 pb-10">
		{@render children()}
	</div>
</div>
