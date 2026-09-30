<script lang="ts">
	export interface Stat {
		label: string;
		value: string;
		detail?: string;
	}

	interface Props {
		stats: Stat[];
	}

	let { stats }: Props = $props();
</script>

<dl class="stats">
	{#each stats as stat (stat.label)}
		<div class="flex min-w-0 flex-col gap-1">
			<dt class="truncate text-[12.5px] text-[var(--text-muted)]">{stat.label}</dt>
			<dd class="truncate text-[20px] font-medium tabular-nums">{stat.value}</dd>
			{#if stat.detail}
				<dd class="truncate text-[12px] text-[var(--text-muted)] tabular-nums">{stat.detail}</dd>
			{/if}
		</div>
	{/each}
</dl>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 20px 24px;
		padding-inline: 4px;
	}
</style>
