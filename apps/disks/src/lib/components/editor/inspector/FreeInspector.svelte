<script lang="ts">
	import { bytes } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { create } from '#lib/editor/edits.js';
	import { creatable, type Layout, type Span } from '#lib/editor/model.js';

	interface Props {
		layout: Layout;
		gap: Span;
		removable: boolean;
	}

	let { layout, gap, removable }: Props = $props();

	let blocked = $derived(creatable(layout, gap));
</script>

<section class="inspector" aria-label="Free space">
	<div class="flex min-w-0 flex-1 flex-col pl-1">
		<h2 class="text-[15px] font-semibold">Free space</h2>
		<p class="text-[13px] text-[var(--text-muted)]">{blocked ?? bytes(gap.size)}</p>
	</div>
	{#if !blocked}
		<button type="button" class="button primary" disabled={editor.running} onclick={() => create(gap, removable ? 'exfat' : 'ext4')}>New partition</button>
	{/if}
</section>

<style>
	.inspector {
		display: flex;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-group);
		background: var(--group);
		padding: 12px 12px 12px 14px;
	}
</style>
