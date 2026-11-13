<script lang="ts">
	import { count } from '../../../format';

	let { rows }: { rows: { label: string; value: number }[] } = $props();

	const merged = $derived.by(() => {
		const totals = new Map<string, number>();
		for (const { label, value } of rows) totals.set(label, (totals.get(label) ?? 0) + value);
		return [...totals].map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value);
	});
	const max = $derived(Math.max(1, ...merged.map((row) => row.value)));
	const total = $derived(merged.reduce((sum, row) => sum + row.value, 0));
</script>

<ul class="flex flex-col gap-3.5 px-4 py-4">
	{#each merged as row (row.label)}
		<li class="flex flex-col gap-1.5">
			<p class="flex items-baseline justify-between gap-3 text-[13.5px]">
				<span class="truncate">{row.label}</span>
				<span class="tabular-nums text-[var(--text-soft)]">
					{count(row.value)}<span class="ml-2 inline-block w-9 text-right text-[12px] text-[var(--text-muted)]">{total ? Math.round((row.value / total) * 100) : 0}%</span>
				</span>
			</p>
			<div class="h-1.5 rounded-full bg-[var(--control)]">
				<div class="bar h-full rounded-full bg-[var(--text-soft)]" style:width="{(row.value / max) * 100}%"></div>
			</div>
		</li>
	{:else}
		<li class="text-[13.5px] text-[var(--text-muted)]">Nothing yet</li>
	{/each}
</ul>

<style>
	.bar {
		transition: width var(--spring-smooth-duration) var(--spring-smooth);
	}
</style>
