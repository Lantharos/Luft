<script lang="ts">
	import { labels } from './accelerator';

	let { accelerators }: { accelerators: string[] } = $props();
</script>

{#if accelerators.length}
	<span class="flex items-center gap-2">
		{#each accelerators as accelerator, index (accelerator)}
			{#if index > 0}
				<span class="text-[12px] text-[var(--text-muted)]">or</span>
			{/if}
			<span class="flex items-center gap-1">
				{#each labels(accelerator) as label, position (position)}
					<kbd>{label}</kbd>
				{/each}
			</span>
		{/each}
	</span>
{:else}
	<span class="text-[13px] text-[var(--text-muted)]">Not set</span>
{/if}

<style>
	kbd {
		display: inline-flex;
		height: 24px;
		min-width: 24px;
		align-items: center;
		justify-content: center;
		padding-inline: 7px;
		border-radius: 8px;
		background: var(--control);
		box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25);
		font-family: inherit;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-soft);
		white-space: nowrap;
	}
</style>
