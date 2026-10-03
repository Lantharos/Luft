<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		dimmed?: boolean;
		children: Snippet;
	}

	let { title, description, dimmed = false, children }: Props = $props();
</script>

<div class="flex min-h-10 items-center gap-4 px-1" class:opacity-60={dimmed}>
	<div class="flex min-w-0 flex-1 flex-col gap-0.5">
		<span class="text-[14px] font-medium">{title}</span>
		<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">{description}</span>
	</div>
	{@render children()}
</div>
