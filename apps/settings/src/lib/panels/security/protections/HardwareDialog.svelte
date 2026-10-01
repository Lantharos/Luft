<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { HostSecurity } from '../api';
	import { byFix, levelSentence } from './hsi';

	let { host, onclose }: { host: HostSecurity; onclose: () => void } = $props();

	const groups = $derived(byFix(host.missing));
</script>

<Dialog title="Hardware security" description="{levelSentence(host)}, level {host.level} of {host.highest}." {onclose}>
	{#if groups.length}
		<div class="flex flex-col gap-2">
			<h3 class="heading">For the next level</h3>
			{#each groups as group (group.fix)}
				<div class="flex flex-col gap-1.5">
					<p class="text-[12.5px] leading-relaxed text-[var(--text-muted)]">{group.sentence}:</p>
					<ul class="list">
						{#each group.items as item (item.id)}
							<li>{item.name}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{:else if host.level >= host.highest}
		<p class="text-[13px] text-[var(--text-soft)]">This is the highest level there is.</p>
	{/if}
	{#if host.runtime.length}
		<div class="flex flex-col gap-1.5">
			<h3 class="heading">Not active right now</h3>
			<ul class="list">
				{#each host.runtime as item (item.id)}
					<li>{item.name}</li>
				{/each}
			</ul>
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Close</button>
	{/snippet}
</Dialog>

<style>
	.heading {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-soft);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
		color: var(--text);
	}
</style>
