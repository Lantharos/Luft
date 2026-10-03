<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { bytes, tooltip } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { create } from '#lib/editor/edits.js';
	import { creatable, end, type Layout, type Span } from '#lib/editor/model.js';
	import { mebibytes } from '#lib/editor/units.js';

	interface Props {
		layout: Layout;
		gap: Span;
		removable: boolean;
	}

	let { layout, gap, removable }: Props = $props();

	let blocked = $derived(creatable(layout, gap));
</script>

<section class="flex flex-col gap-3">
	<div class="flex items-start gap-3 px-1">
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<h2 class="text-[16px] font-semibold">Free space</h2>
			<p class="text-[13px] text-[var(--text-muted)] tabular-nums">
				{bytes(gap.size)} · {mebibytes(gap.size)} MiB from {mebibytes(gap.offset)} MiB to {mebibytes(end(gap))} MiB
			</p>
		</div>
		{#if !blocked}
			<button type="button" class="button primary" disabled={editor.running} onclick={() => create(gap, removable ? 'exfat' : 'ext4')}>
				New partition
			</button>
		{/if}
		<button type="button" class="icon-button" aria-label="Show all partitions" onclick={() => (editor.selected = null)} {@attach tooltip('Show all partitions')}>
			<X size={18} />
		</button>
	</div>
	{#if blocked}
		<p class="px-1 text-[12.5px] text-[var(--text-muted)]">{blocked}</p>
	{/if}
</section>
