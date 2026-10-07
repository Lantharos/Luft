<script lang="ts">
	import BatteryFull from '@lucide/svelte/icons/battery-full';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Wifi from '@lucide/svelte/icons/wifi';
	import { AppIcon, appearance } from '@luft/ui';
	import type { App } from '../../apps/api';
	import type { Alignment, AutoHide, Look, Size, Style } from './options';

	interface Props {
		wallpaper: string | null;
		apps: App[];
		alignment: Alignment;
		look: Look;
		style: Style;
		size: Size;
		autoHide: AutoHide;
	}

	let { wallpaper, apps, alignment, look, style, size, autoHide }: Props = $props();

	const METRICS: Record<Size, { height: number; button: number; icon: number }> = {
		compact: { height: 26, button: 22, icon: 14 },
		normal: { height: 31, button: 26, icon: 18 },
		large: { height: 36, button: 31, icon: 22 }
	};
	const FLOATING_MARGIN = 8;
	const RUNNING = 2;

	let metrics = $derived(METRICS[size]);
	let floating = $derived(style === 'floating');
	let dark = $derived(appearance.colors.dark);
	let tint = $derived(isLight(dark.primaryContainer) ? dark.surfaceContainerHighest : dark.primaryContainer);
	let time = $state(clock());

	function isLight(hex: string | undefined) {
		if (!hex) return false;
		const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 128;
	}

	function clock() {
		return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
	}

	$effect(() => {
		const timer = setInterval(() => (time = clock()), 30_000);
		return () => clearInterval(timer);
	});
</script>

<div class="screen" class:empty={!wallpaper} role="img" aria-label="Taskbar preview">
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}
	<div
		class="bar {look}"
		class:floating
		class:left={alignment === 'left'}
		class:hides={autoHide === 'always'}
		style:--height="{metrics.height}px"
		style:--button="{metrics.button}px"
		style:--margin="{floating ? FLOATING_MARGIN : 0}px"
		style:--tint={tint}
		style:--solid={dark.surfaceContainer}
	>
		<div class="apps">
			<span class="slot start" aria-hidden="true">
				<svg viewBox="0 0 187 197" width={metrics.icon} height={metrics.icon}>
					<path d="M119.718 130.99C159.986 113.061 161.602 43.9304 179.53 84.1989C197.459 124.467 179.349 171.645 139.081 189.574C98.8128 207.503 51.6341 189.393 33.7053 149.125C15.7766 108.856 79.4495 148.919 119.718 130.99Z" opacity="0.6" />
					<path d="M78.4133 63.6013C118.682 45.6726 131.515 -28.4531 149.444 11.8151C167.372 52.0837 149.262 99.2624 108.993 117.191C68.7249 135.12 21.5471 117.009 3.61838 76.7409C-14.3103 36.4724 38.1448 81.5298 78.4133 63.6013Z" />
				</svg>
			</span>
			{#each apps as app, index (app.id)}
				<span class="slot" class:focused={index === 0}>
					<AppIcon icon={app.icon} id={app.id} size={metrics.icon} />
					{#if index < RUNNING}
						<span class="dot"></span>
					{/if}
				</span>
			{/each}
		</div>
		<div class="status">
			<Wifi size={metrics.icon * 0.62} />
			<Volume2 size={metrics.icon * 0.62} />
			<BatteryFull size={metrics.icon * 0.62} />
			<span class="time">{time}</span>
		</div>
	</div>
</div>

<style>
	.screen {
		position: relative;
		overflow: hidden;
		aspect-ratio: 5 / 2;
		border-radius: 16px;
		background: var(--control);
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.bar {
		position: absolute;
		right: var(--margin);
		bottom: var(--margin);
		left: var(--margin);
		height: var(--height);
		border-radius: 0;
		color: #fff;
		transition:
			left 260ms var(--ease),
			right 260ms var(--ease),
			bottom 260ms var(--ease),
			height 260ms var(--ease),
			border-radius 260ms var(--ease),
			background-color 200ms var(--ease),
			transform 240ms var(--ease);
	}

	.bar.floating {
		border-radius: calc(var(--height) / 2);
	}

	.bar.glass {
		background: rgba(20, 20, 24, 0.38);
		backdrop-filter: blur(14px) saturate(1.2);
	}

	.bar.solid {
		background: var(--solid, #1b1b1f);
	}

	.bar.accent {
		background: color-mix(in srgb, var(--tint, #333) 62%, transparent);
		backdrop-filter: blur(14px) saturate(1.2);
	}

	.bar.transparent .apps,
	.bar.transparent .status {
		filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.55));
	}

	.bar.hides {
		transform: translateY(calc(100% + var(--margin)));
	}

	.screen:hover .bar.hides {
		transform: none;
	}

	.apps {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		gap: 1px;
		transform: translate(-50%, -50%);
		transition:
			left 260ms var(--ease),
			transform 260ms var(--ease);
	}

	.bar.left .apps {
		left: calc(var(--height) / 4);
		transform: translate(0, -50%);
	}

	.slot {
		position: relative;
		display: grid;
		width: var(--button);
		height: var(--button);
		place-items: center;
		border-radius: 8px;
		transition:
			width 260ms var(--ease),
			height 260ms var(--ease);
	}

	.start svg {
		fill: currentColor;
	}

	.slot.focused {
		background: rgba(255, 255, 255, 0.15);
	}

	.dot {
		position: absolute;
		bottom: 1.5px;
		left: 50%;
		width: 3px;
		height: 3px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.65);
		transform: translateX(-50%);
	}

	.focused .dot {
		width: 8px;
		background: var(--accent);
	}

	.status {
		position: absolute;
		top: 50%;
		right: calc(var(--height) / 4);
		display: flex;
		align-items: center;
		gap: 6px;
		transform: translateY(-50%);
		font-size: 10px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.time {
		margin-left: 2px;
	}
</style>
