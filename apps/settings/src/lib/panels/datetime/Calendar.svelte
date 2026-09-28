<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		year: number;
		month: number;
		day: number;
		onselect: (year: number, month: number, day: number) => void;
	}

	const SUNDAY = Date.UTC(2023, 0, 1);
	const DAY = 86_400_000;
	const firstWeekday = new Intl.Locale(navigator.language).getWeekInfo().firstDay % 7;
	const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
	const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'narrow', timeZone: 'UTC' });
	const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormat.format(SUNDAY + ((firstWeekday + index) % 7) * DAY));

	let { year, month, day, onselect }: Props = $props();

	let shift = $state(0);

	let shown = $derived.by(() => {
		const index = year * 12 + month - 1 + shift;
		return { year: Math.floor(index / 12), month: (index % 12) + 1 };
	});
	let leading = $derived((new Date(Date.UTC(shown.year, shown.month - 1, 1)).getUTCDay() - firstWeekday + 7) % 7);
	let length = $derived(new Date(Date.UTC(shown.year, shown.month, 0)).getUTCDate());

	function select(chosen: number) {
		shift = 0;
		onselect(shown.year, shown.month, chosen);
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<button type="button" class="plain-button nav" aria-label="Previous month" onclick={() => (shift -= 1)}>
			<ChevronLeft size={18} />
		</button>
		<span class="text-[14px] font-semibold">{monthTitle.format(Date.UTC(shown.year, shown.month - 1, 1))}</span>
		<button type="button" class="plain-button nav" aria-label="Next month" onclick={() => (shift += 1)}>
			<ChevronRight size={18} />
		</button>
	</div>
	<div class="grid grid-cols-7 gap-1 text-center">
		{#each weekdays as weekday, index (index)}
			<span class="py-1 text-[12px] font-medium text-[var(--text-muted)]">{weekday}</span>
		{/each}
		{#each { length: leading }, index (index)}
			<span></span>
		{/each}
		{#each { length }, index (index)}
			{@const date = index + 1}
			<button
				type="button"
				class="date"
				class:selected={shown.year === year && shown.month === month && date === day}
				onclick={() => select(date)}
			>
				{date}
			</button>
		{/each}
	</div>
</div>

<style>
	.nav {
		min-height: 32px;
		width: 32px;
		padding: 0;
	}

	.date {
		height: 36px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		color: var(--text-soft);
		transition: background-color 160ms var(--ease), color 160ms var(--ease);
	}

	.date:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.date.selected {
		background: var(--accent);
		color: var(--accent-text);
		font-weight: 600;
	}
</style>
