<script lang="ts">
	import { count, shortCount } from '../../../format';
	import { niceMax, path, ticks, type Day } from './scale';

	let { days, installs }: { days: Day[]; installs: string } = $props();

	const SERIES = [
		{ key: 'installs', color: 'var(--text)' },
		{ key: 'updates', color: 'var(--tertiary)' }
	] as const;
	const HEIGHT = 220;
	const TIP_WIDTH = 160;
	const TIP_GAP = 12;
	const PAD = { top: 12, right: 8, bottom: 26, left: 40 };
	const label = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });

	let width = $state(640);
	let active = $state<number | null>(null);

	const plotWidth = $derived(Math.max(1, width - PAD.left - PAD.right));
	const plotHeight = HEIGHT - PAD.top - PAD.bottom;
	const max = $derived(niceMax(Math.max(0, ...days.flatMap((day) => [day.installs, day.updates]))));
	const x = (index: number) => PAD.left + (days.length > 1 ? (index / (days.length - 1)) * plotWidth : plotWidth / 2);
	const y = (value: number) => PAD.top + plotHeight - (value / max) * plotHeight;
	const dayLabel = (day: string) => label.format(new Date(`${day}T00:00:00Z`));
	const xTicks = $derived(days.length ? [...new Set([0, Math.floor((days.length - 1) / 2), days.length - 1])] : []);
	const point = $derived(active === null ? null : days[active]);
	const names = $derived({ installs, updates: 'Updates' });

	function pointer(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const fraction = (event.clientX - box.left - PAD.left) / plotWidth;
		active = Math.min(days.length - 1, Math.max(0, Math.round(fraction * (days.length - 1))));
	}

	function keydown(event: KeyboardEvent) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		active = Math.min(days.length - 1, Math.max(0, (active ?? days.length - 1) + step));
	}
</script>

<figure class="flex flex-col gap-3">
	<figcaption class="flex gap-5 text-[12.5px] text-[var(--text-muted)]">
		{#each SERIES as series (series.key)}
			<span class="flex items-center gap-2"><span class="swatch" style:background={series.color}></span>{names[series.key]}</span>
		{/each}
	</figcaption>
	<div
		class="relative"
		bind:clientWidth={width}
		role="slider"
		tabindex="0"
		aria-label="{installs} and updates each day"
		aria-valuemin={0}
		aria-valuemax={Math.max(0, days.length - 1)}
		aria-valuenow={active ?? days.length - 1}
		aria-valuetext={point ? `${dayLabel(point.day)}: ${count(point.installs)} ${installs.toLowerCase()}, ${count(point.updates)} updates` : undefined}
		onpointermove={pointer}
		onpointerleave={() => (active = null)}
		onkeydown={keydown}
		onblur={() => (active = null)}
	>
		<svg {width} height={HEIGHT} aria-hidden="true" class="block overflow-visible">
			{#each ticks(max) as tick (tick)}
				<line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} class="grid" />
				<text x={PAD.left - 10} y={y(tick)} dy="0.32em" text-anchor="end" class="axis">{shortCount(tick)}</text>
			{/each}
			{#each xTicks as index (index)}
				<text x={x(index)} y={HEIGHT - 6} text-anchor={index === 0 ? 'start' : index === days.length - 1 ? 'end' : 'middle'} class="axis">{dayLabel(days[index].day)}</text>
			{/each}
			{#each SERIES as series (series.key)}
				<path d={path(days.map((day, index) => [x(index), y(day[series.key])]))} fill="none" stroke={series.color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" class="line" />
			{/each}
			{#if point && active !== null}
				<line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotHeight} class="cursor" />
				{#each SERIES as series (series.key)}
					<circle cx={x(active)} cy={y(point[series.key])} r="4.5" fill={series.color} class="dot" />
				{/each}
			{/if}
		</svg>
		{#if point && active !== null}
			<div class="tip" style:left="{x(active) + TIP_GAP + TIP_WIDTH > width ? x(active) - TIP_GAP - TIP_WIDTH : x(active) + TIP_GAP}px" role="status">
				<p class="font-medium">{dayLabel(point.day)}</p>
				{#each SERIES as series (series.key)}
					<p class="flex items-center justify-between gap-3 text-[var(--text-soft)]">
						<span class="flex items-center gap-1.5"><span class="swatch" style:background={series.color}></span>{names[series.key]}</span>
						<span class="tabular-nums text-[var(--text)]">{count(point[series.key])}</span>
					</p>
				{/each}
			</div>
		{/if}
	</div>
</figure>

<style>
	.swatch {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-pill);
	}

	.grid {
		stroke: color-mix(in srgb, var(--text) 8%, transparent);
	}

	.axis {
		fill: var(--text-muted);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
	}

	.cursor {
		stroke: var(--text-muted);
		stroke-dasharray: 2 3;
	}

	.dot {
		stroke: var(--surface);
		stroke-width: 2;
	}

	.tip {
		position: absolute;
		top: 4px;
		z-index: 1;
		display: flex;
		width: 160px;
		flex-direction: column;
		gap: 4px;
		pointer-events: none;
		border-radius: 12px;
		background: var(--popover);
		box-shadow: var(--shadow-soft);
		padding: 10px 12px;
		font-size: 12.5px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.line {
			stroke-dasharray: 4000;
			animation: draw 900ms var(--ease-decelerate) both;
		}
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 4000;
		}
	}
</style>
