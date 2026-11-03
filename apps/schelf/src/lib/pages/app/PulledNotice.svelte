<script lang="ts">
	import type { Block, InstalledApp } from '#lib/bindings.js';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';

	let { name, block, app }: { name: string; block: Block; app: InstalledApp } = $props();

	let removing = $state(false);

	const pulled = $derived(block.action === 'block');
	const why = $derived(block.note ?? block.reason);
</script>

<div class="flex items-center justify-between gap-4 rounded-[var(--radius-group)] bg-[var(--surface)] px-5 py-4">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="text-[14px] font-semibold" class:text-[var(--danger)]={pulled}>
			{pulled ? `schelf.store pulled ${name}` : `schelf.store has a warning about this version of ${name}`}
		</span>
		<p class="text-[13.5px] text-[var(--text-soft)]">
			{why}{pulled ? ` It can't start any more. Your files stay until you remove it.` : ''}
		</p>
	</div>
	{#if pulled}
		<button type="button" class="button danger" onclick={() => (removing = true)}>Remove</button>
	{/if}
</div>

{#if removing}
	<RemoveDialog {app} onclose={() => (removing = false)} />
{/if}
