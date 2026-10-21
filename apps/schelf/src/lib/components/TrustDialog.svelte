<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { CheckedSource } from '#lib/bridge/types.js';

	let { source, action = 'Add source', onconfirm, onclose }: { source: CheckedSource; action?: string; onconfirm: () => void; onclose: () => void } = $props();

	const name = $derived(source.described.sources[0]?.name ?? source.described.file);

	function grouped(fingerprint: string) {
		const groups = fingerprint.match(/.{1,4}/g) ?? [];
		const half = Math.ceil(groups.length / 2);
		return `${groups.slice(0, half).join(' ')}  ${groups.slice(half).join(' ')}`;
	}
</script>

<Dialog
	title="Trust {name}?"
	description="Packages from this source become part of the system, with full access to the computer, and update with Luft. Only add sources you trust."
	wide
	{onclose}
>
	<div class="flex flex-col gap-4 text-[13.5px]">
		<div class="flex flex-col gap-2">
			{#each source.described.sources as entry (entry.id)}
				<div class="flex min-w-0 flex-col">
					<span class="font-medium">{entry.name}</span>
					<span class="truncate text-[var(--text-muted)]">{entry.url}</span>
				</div>
			{/each}
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-[var(--text-muted)]">Its packages are checked against {source.described.keys.length === 1 ? 'this key' : 'these keys'}:</span>
			{#each source.described.keys as key (key.fingerprint)}
				<div class="flex min-w-0 flex-col">
					<span class="truncate">{key.user}</span>
					<span class="fingerprint">{grouped(key.fingerprint)}</span>
				</div>
			{/each}
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="button" data-autofocus onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" onclick={onconfirm}>{action}</button>
	{/snippet}
</Dialog>

<style>
	.fingerprint {
		font-family: var(--font-mono);
		font-size: 12.5px;
		white-space: pre;
		color: var(--text-soft);
	}
</style>
