<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import BatteryFull from '@lucide/svelte/icons/battery-full';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Wifi from '@lucide/svelte/icons/wifi';
	import { AppIcon, appearance, MARK_HEIGHT, MARK_LAYERS, MARK_SCALE, MARK_WIDTH, PAINTED_MARK_SCALE, type GlassShading, type Shadow } from '@luft/ui';
	import type { App } from '../../../system/apps/api';
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
	const SCALE = 0.65;
	const FLOATING_MARGIN = 8;
	const RUNNING = 2;

	let metrics = $derived(METRICS[size]);
	let floating = $derived(style === 'floating');
	let paint = $derived(appearance.taskbar?.[look]);
	let markSize = $derived(Math.round(metrics.button * MARK_SCALE));
	let markIcon = $derived(Math.round(markSize * ((appearance.appIcons?.style ?? 'default') === 'default' ? 1 : PAINTED_MARK_SCALE)));
	let time = $state(clock());

	const px = (value: number) => `${value * SCALE}px`;
	const dropShadow = (shadow: Shadow | null) => (shadow ? `drop-shadow(${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${shadow.color})` : 'none');
	const textShadow = (shadow: Shadow | null) => (shadow ? `${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${shadow.color}` : 'none');
	const boxShadow = (shadow: Shadow | null) => (shadow ? `${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${px(shadow.spread)} ${shadow.color}` : 'none');
	const backdrop = (glass: GlassShading | null) =>
		glass ? `blur(14px) saturate(${glass.saturation}) contrast(${1 - glass.lift * 0.8}) brightness(${1 + glass.lift * 0.8 - glass.dim / 10})` : 'none';

	function clock() {
		return new Intl.DateTimeFormat(i18n.formats, { hour: 'numeric', minute: '2-digit' }).format(new Date());
	}

	$effect(() => {
		const timer = setInterval(() => (time = clock()), 30_000);
		return () => clearInterval(timer);
	});
</script>

<div class="screen" class:empty={!wallpaper} role="img" aria-label={t('settings-taskbar-preview')}>
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}
	<div
		class="bar"
		class:floating
		class:left={alignment === 'left'}
		class:hides={autoHide === 'always'}
		style:--height="{metrics.height}px"
		style:--button="{metrics.button}px"
		style:--margin="{floating ? FLOATING_MARGIN : 0}px"
		style:--surface={paint?.surface}
		style:--backdrop={backdrop(paint?.glass ?? null)}
		style:--ink={paint?.ink}
		style:--focused={paint?.focused}
		style:--dot={paint?.dot}
		style:--focused-dot={paint?.focusedDot}
		style:--icon-halo={dropShadow(paint?.iconHalo ?? null)}
		style:--status-icon-halo={dropShadow(paint?.status.icon ?? null)}
		style:--status-text-halo={textShadow(paint?.status.text ?? null)}
		style:--dot-halo={boxShadow(paint?.status.dot ?? null)}
	>
		<div class="apps">
			<span class="slot" aria-hidden="true">
				<span class="mark" style:width="{markSize}px" style:height="{markSize}px">
					{#each MARK_LAYERS as layer, index (index)}
						<svg viewBox="0 0 {MARK_WIDTH} {MARK_HEIGHT}" width={markIcon} height={markIcon} class:halo={layer.halo} fill={paint?.mark[layer.fill]}>
							<path d={layer.path} />
						</svg>
					{/each}
				</span>
			</span>
			{#each apps as app, index (app.id)}
				<span class="slot" class:focused={index === 0}>
					<span class="icon"><AppIcon icon={app.icon} id={app.id} size={metrics.icon} /></span>
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
		background: var(--surface);
		backdrop-filter: var(--backdrop);
		color: var(--ink);
		transition:
			left var(--spring-snappy-duration) var(--spring-snappy),
			right var(--spring-snappy-duration) var(--spring-snappy),
			bottom var(--spring-snappy-duration) var(--spring-snappy),
			height var(--spring-snappy-duration) var(--spring-snappy),
			border-radius var(--spring-snappy-duration) var(--spring-snappy),
			background-color var(--motion-tap) var(--ease-decelerate),
			transform var(--spring-snappy-duration) var(--spring-snappy);
	}

	.bar.floating {
		border-radius: calc(var(--height) / 2);
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
			left var(--spring-snappy-duration) var(--spring-snappy),
			transform var(--spring-snappy-duration) var(--spring-snappy);
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
			width var(--spring-snappy-duration) var(--spring-snappy),
			height var(--spring-snappy-duration) var(--spring-snappy);
	}

	.mark {
		display: grid;
		place-items: center;
	}

	.mark svg {
		grid-area: 1 / 1;
	}

	.mark .halo,
	.icon {
		filter: var(--icon-halo);
	}

	.icon {
		display: grid;
	}

	.slot.focused {
		background: var(--focused);
	}

	.dot {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 3px;
		height: 3px;
		border-radius: 1.5px;
		background: var(--dot);
		box-shadow: var(--dot-halo);
		transform: translateX(-50%);
	}

	.focused .dot {
		width: 8px;
		background: var(--focused-dot);
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
		text-shadow: var(--status-text-halo);
	}

	.status > :global(svg) {
		filter: var(--status-icon-halo);
	}

	.time {
		margin-left: 2px;
	}
</style>
