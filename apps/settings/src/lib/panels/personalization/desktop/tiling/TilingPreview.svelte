<script lang="ts">
	import { t } from '@luft/i18n';
	import type { TilingLayout, TilingMode } from './options';

	interface Props {
		wallpaper: string | null;
		mode: TilingMode;
		layout: TilingLayout;
		gap: number;
	}

	let { wallpaper, mode, layout, gap }: Props = $props();

	type Box = { x: number; y: number; width: number; height: number; shown: boolean };

	const WIDTH = 1440;
	const HEIGHT = 900;
	const TASKBAR = 48;
	const AREA = HEIGHT - TASKBAR;
	const MASTER = 0.55;
	const WINDOWS = 4;

	const box = (x: number, y: number, width: number, height: number, shown = true): Box => ({ x, y, width, height, shown });

	function floating(): Box[] {
		return [box(110, 90, 620, 430), box(560, 230, 660, 440), box(260, 400, 520, 330), box(720, 260, 400, 300, false)];
	}

	function dwindle(g: number): Box[] {
		const width = WIDTH - 2 * g;
		const height = AREA - 2 * g;
		const half = (width - g) / 2;
		const right = g + half + g;
		const top = (height - g) / 2;
		const quarter = (half - g) / 2;
		return [
			box(g, g, half, height),
			box(right, g, half, top),
			box(right, g + top + g, quarter, top),
			box(right + quarter + g, g + top + g, quarter, top)
		];
	}

	function master(g: number): Box[] {
		const width = WIDTH - 2 * g;
		const height = AREA - 2 * g;
		const main = (width - g) * MASTER;
		const stack = width - g - main;
		const row = (height - 2 * g) / 3;
		return [box(g, g, main, height), ...[0, 1, 2].map((index) => box(g + main + g, g + index * (row + g), stack, row))];
	}

	function scrolling(g: number): Box[] {
		const column = (share: number) => share * (WIDTH - g) - g;
		const [first, focused, next] = [column(1 / 2), column(2 / 3), column(1 / 2)];
		const left = (WIDTH - focused) / 2;
		const height = AREA - 2 * g;
		return [box(left - g - first, g, first, height), box(left, g, focused, height), box(left + focused + g, g, next, height), box(left + focused + 2 * g + next, g, first, height, false)];
	}

	let boxes = $derived(mode === 'off' ? floating() : mode === 'scrolling' ? scrolling(gap) : layout === 'master' ? master(gap) : dwindle(gap));
	let squared = $derived(mode !== 'off' && gap === 0);
	const percent = (value: number, of: number) => `${(value / of) * 100}%`;
</script>

<div class="stage">
<div class="screen" role="img" aria-label={t('settings-tiling-preview')}>
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}
	{#each Array.from({ length: WINDOWS }, (_, index) => boxes[index]!) as window, index (index)}
		<span
			class="window"
			class:squared
			class:focused={index === 1}
			class:hidden={!window.shown}
			style:left={percent(window.x, WIDTH)}
			style:top={percent(window.y, HEIGHT)}
			style:width={percent(window.width, WIDTH)}
			style:height={percent(window.height, HEIGHT)}
		>
			<span class="title"></span>
		</span>
	{/each}
	<span class="taskbar" style:height={percent(TASKBAR, HEIGHT)}></span>
</div>
</div>

<style>
	.stage {
		display: grid;
		place-items: center;
		height: 260px;
	}

	.screen {
		position: relative;
		overflow: hidden;
		height: 212px;
		aspect-ratio: 16 / 10;
		border-radius: 10px;
		/* overflow alone lets composited children, such as the taskbar, keep square corners */
		clip-path: inset(0 round 10px);
		background: var(--control);
		box-shadow: 0 8px 24px var(--shadow-faint);
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.window {
		position: absolute;
		overflow: hidden;
		border-radius: 8px;
		background: color-mix(in oklab, var(--raised) 92%, transparent);
		box-shadow: 0 6px 18px var(--shadow-faint);
		transition:
			left var(--spring-smooth-duration) var(--spring-smooth),
			top var(--spring-smooth-duration) var(--spring-smooth),
			width var(--spring-smooth-duration) var(--spring-smooth),
			height var(--spring-smooth-duration) var(--spring-smooth),
			border-radius var(--motion-tap) var(--ease-decelerate),
			opacity var(--motion-tap) var(--ease-decelerate);
	}

	.window.focused {
		z-index: 1;
	}

	.window.squared {
		border-radius: 0;
		box-shadow: none;
	}

	.window.hidden {
		opacity: 0;
	}

	.title {
		position: absolute;
		inset: 0 0 auto;
		height: 14%;
		max-height: 18px;
		background: color-mix(in oklab, var(--ink) 6%, transparent);
	}

	.taskbar {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		border-radius: 0 0 10px 10px;
		background: color-mix(in oklab, var(--raised) 70%, transparent);
	}
</style>
