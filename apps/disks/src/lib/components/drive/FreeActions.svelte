<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { Drive } from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { bytes } from '$lib/format';

	interface Props {
		drive: Drive;
		segment: { offset: number; size: number };
	}

	let { drive, segment }: Props = $props();

	let canCreate = $derived(!drive.readOnly);
	let blank = $derived(!drive.table);
</script>

<div class="flex flex-wrap items-center gap-2 px-1.5">
	<p class="min-w-0 flex-1 text-[14px] text-[var(--text-soft)]">
		{bytes(segment.size)} of free space{blank ? ' without a partition table' : ''}
	</p>
	{#if canCreate}
		{#if blank}
			<button type="button" class="button primary" onclick={() => dialogs.open({ kind: 'format-drive', drive })}>Format drive…</button>
		{:else}
			<button type="button" class="button primary" onclick={() => dialogs.open({ kind: 'create', drive, offset: segment.offset, size: segment.size })}>
				<Plus size={16} />
				New partition…
			</button>
		{/if}
	{/if}
</div>
