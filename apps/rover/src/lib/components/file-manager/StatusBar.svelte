<script lang="ts">
	import { formatBytes } from '$lib/utils';

	interface Props {
		itemCount: number;
		selectedCount: number;
		selectedSize: number;
	}

	let { itemCount, selectedCount, selectedSize }: Props = $props();
</script>

<footer
	class="flex h-8 shrink-0 items-center justify-between gap-3 bg-[var(--content)] px-5 text-[12px] text-[var(--text-muted)] shadow-[0_-1px_0_var(--hairline)]"
>
	<span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
	<span>
		{#if selectedCount > 0}
			{selectedCount} selected{selectedSize > 0 ? ` (${formatBytes(selectedSize)})` : ''}
		{:else}
			Ready
		{/if}
	</span>
</footer>
