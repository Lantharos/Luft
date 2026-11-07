<script lang="ts">
	import { bytes, Dialog } from '@luft/ui';
	import type { MoveDestination } from '#lib/bindings.js';

	interface Props {
		destination: MoveDestination;
		onback: () => void;
		onerase: () => void;
	}

	let { destination, onback, onerase }: Props = $props();
</script>

<Dialog title="Erase {destination.name} for Luft?" wide onclose={onback}>
	{#if destination.erase.contents.length}
		<p class="text-[13.5px] leading-relaxed">These are deleted for good, along with everything on them:</p>
		<ul class="row-group">
			{#each destination.erase.contents as part (part.name)}
				<li class="line">
					<span class="min-w-0 flex-1 truncate">{part.name}</span>
					<span class="text-[13px] text-[var(--text-muted)] tabular-nums">{bytes(part.size)}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-[13.5px] leading-relaxed">Nothing on it can be read now, and whatever is still on it is gone for good once it’s erased.</p>
	{/if}
	<p class="text-[13.5px] leading-relaxed">Luft then gets all {bytes(destination.erase.luft)} of it, and moves there the next time the computer starts.</p>

	{#snippet actions()}
		<button type="button" class="button" onclick={onback}>Back</button>
		<button type="button" class="button danger" onclick={onerase}>Erase and move Luft</button>
	{/snippet}
</Dialog>

<style>
	.line {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		font-size: 13.5px;
	}
</style>
