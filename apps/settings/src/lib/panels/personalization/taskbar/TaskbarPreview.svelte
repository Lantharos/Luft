<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import BatteryFull from '@lucide/svelte/icons/battery-full';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Wifi from '@lucide/svelte/icons/wifi';
	import { AppIcon, appearance, MARK_HEIGHT, MARK_LAYERS, MARK_SCALE, MARK_WIDTH, PAINTED_MARK_SCALE, type GlassShading, type Shadow } from '@luft/ui';
	import type { App } from '#lib/bindings.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { isVertical, type Alignment, type AutoHide, type Look, type Position, type Size, type Style } from './options';

	interface Props {
		wallpaper: string | null;
		apps: App[];
		position: Position;
		alignment: Alignment;
		look: Look;
		style: Style;
		size: Size;
		autoHide: AutoHide;
		shown: boolean;
		startButton: boolean;
	}

	let { wallpaper, apps, position, alignment, look, style, size, autoHide, shown, startButton }: Props = $props();

	const METRICS: Record<Size, { height: number; button: number; icon: number }> = {
		compact: { height: 26, button: 22, icon: 14 },
		normal: { height: 31, button: 26, icon: 18 },
		large: { height: 36, button: 31, icon: 22 }
	};
	const SCALE = 0.65;
	const FLOATING_MARGIN = 8;
	const RUNNING = 2;
	const VERTICAL_APPS = 3;

	let metrics = $derived(METRICS[size]);
	let floating = $derived(style === 'floating');
	let separate = $derived(style === 'separate');
	let vertical = $derived(isVertical(position));
	let shownApps = $derived(vertical ? apps.slice(0, VERTICAL_APPS) : apps);
	let paint = $derived(appearance.taskbar?.[look]);
	let cornerPaint = $derived(appearance.taskbar?.glass);
	let markSize = $derived(Math.round(metrics.button * MARK_SCALE));
	let markIcon = $derived(Math.round(markSize * ((appearance.appIcons?.style ?? 'default') === 'default' ? 1 : PAINTED_MARK_SCALE)));
	const CLOCK_TICK = 30_000;

	type Clock = { 'clock-format': string; 'clock-show-weekday': boolean };
	const clock = useSettings<Clock>('org.gnome.desktop.interface', ['clock-format', 'clock-show-weekday']);

	let now = $state(new Date());
	let twelveHour = $derived(clock.values['clock-format'] === '12h');
	let time = $derived(
		new Intl.DateTimeFormat(i18n.formats, twelveHour ? { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' } : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
	);
	let date = $derived(
		new Intl.DateTimeFormat(i18n.formats, { ...(clock.values['clock-show-weekday'] ? { weekday: 'short' } : {}), day: 'numeric', month: 'short' }).format(now)
	);

	const px = (value: number) => `${value * SCALE}px`;
	const dropShadow = (shadow: Shadow | null) => (shadow ? `drop-shadow(${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${shadow.color})` : 'none');
	const textShadow = (shadow: Shadow | null) => (shadow ? `${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${shadow.color}` : 'none');
	const boxShadow = (shadow: Shadow | null) => (shadow ? `${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${px(shadow.spread)} ${shadow.color}` : 'none');
	const backdrop = (glass: GlassShading | null) =>
		glass ? `blur(14px) saturate(${glass.saturation}) contrast(${1 - glass.lift * 0.8}) brightness(${1 + glass.lift * 0.8 - glass.dim / 10})` : 'none';

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), CLOCK_TICK);
		return () => clearInterval(timer);
	});
</script>

<div class="screen" class:empty={!wallpaper} role="img" aria-label={t('settings-taskbar-preview')}>
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}
	<div
		class="bar {position}"
		class:vertical
		class:gone={!shown}
		class:floating
		class:separate
		class:aligned={alignment === 'left'}
		class:hides={autoHide === 'always'}
		style:--height="{metrics.height}px"
		style:--button="{metrics.button}px"
		style:--margin="{style === 'bar' ? 0 : FLOATING_MARGIN}px"
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
			<span class="slot" class:hidden={!startButton} aria-hidden="true">
				<span class="mark" style:width="{markSize}px" style:height="{markSize}px">
					{#each MARK_LAYERS as layer, index (index)}
						<svg viewBox="0 0 {MARK_WIDTH} {MARK_HEIGHT}" width={markIcon} height={markIcon} class:halo={layer.halo} fill={paint?.mark[layer.fill]}>
							<path d={layer.path} />
						</svg>
					{/each}
				</span>
			</span>
			{#each shownApps as app, index (app.id)}
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
			{#if !vertical}
				<Volume2 size={metrics.icon * 0.62} />
			{/if}
			<BatteryFull size={metrics.icon * 0.62} />
			{#if vertical}
				<span class="time">{time}</span>
			{:else}
				<span class="time stacked"><span>{date}</span><span>{time}</span></span>
			{/if}
		</div>
	</div>
	<div
		class="corner {position}"
		class:vertical
		class:shown={!shown}
		style:--surface={cornerPaint?.surface}
		style:--backdrop={backdrop(cornerPaint?.glass ?? null)}
		style:--ink={cornerPaint?.ink}
	>
		{#if startButton}
			<span class="pill round" aria-hidden="true">
				<span class="mark">
					{#each MARK_LAYERS as layer, index (index)}
						<svg viewBox="0 0 {MARK_WIDTH} {MARK_HEIGHT}" width={14} height={14} class:halo={layer.halo} fill={cornerPaint?.mark[layer.fill]}>
							<path d={layer.path} />
						</svg>
					{/each}
				</span>
			</span>
		{/if}
		<span class="pill">
			<Wifi size={11} />
			<Volume2 size={11} />
			<BatteryFull size={11} />
		</span>
		<span class="pill time">{time}</span>
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
		--slot-radius: 8px;
		--out-x: 0;
		--out-y: 1;
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
			top var(--spring-snappy-duration) var(--spring-snappy),
			bottom var(--spring-snappy-duration) var(--spring-snappy),
			width var(--spring-snappy-duration) var(--spring-snappy),
			height var(--spring-snappy-duration) var(--spring-snappy),
			border-radius var(--spring-snappy-duration) var(--spring-snappy),
			background-color var(--motion-tap) var(--ease-decelerate),
			transform var(--spring-snappy-duration) var(--spring-snappy);
	}

	.bar.top {
		--out-y: -1;
		top: var(--margin);
		bottom: auto;
	}

	.bar.vertical {
		--out-y: 0;
		top: var(--margin);
		width: var(--height);
		height: auto;
	}

	.bar.left {
		--out-x: -1;
		right: auto;
	}

	.bar.right {
		--out-x: 1;
		left: auto;
	}

	.bar.gone {
		transform: translate(calc(var(--out-x) * (100% + var(--margin) + 4px)), calc(var(--out-y) * (100% + var(--margin) + 4px)));
	}

	.slot.hidden {
		display: none;
	}

	.corner {
		position: absolute;
		right: 8px;
		bottom: 8px;
		display: flex;
		gap: 5px;
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity var(--motion-tap) var(--ease-decelerate),
			transform var(--spring-snappy-duration) var(--spring-snappy);
	}

	.corner.top {
		top: 8px;
		bottom: auto;
		transform: translateY(-8px);
	}

	.corner.vertical {
		flex-direction: column;
		align-items: flex-start;
	}

	.corner.left {
		right: auto;
		left: 8px;
		transform: translateX(-8px);
	}

	.corner.right {
		align-items: flex-end;
		transform: translateX(8px);
	}

	.corner.shown {
		opacity: 1;
		transform: none;
	}

	.pill {
		display: flex;
		height: 23px;
		align-items: center;
		gap: 6px;
		padding: 0 9px;
		border-radius: 999px;
		background: var(--surface);
		backdrop-filter: var(--backdrop);
		color: var(--ink);
		font-size: 10px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.pill.round {
		width: 23px;
		justify-content: center;
		padding: 0;
	}

	.bar.floating {
		border-radius: calc(var(--slot-radius) + (var(--height) - var(--button)) / 2);
	}

	.bar.hides {
		transform: translate(calc(var(--out-x) * (100% + var(--margin))), calc(var(--out-y) * (100% + var(--margin))));
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

	.bar.aligned:not(.vertical) .apps {
		left: calc(var(--height) / 4);
		transform: translate(0, -50%);
	}

	.bar.floating.aligned:not(.vertical) .apps {
		left: calc((var(--height) - var(--button)) / 2);
	}

	.bar.floating:not(.vertical) .status {
		right: calc((var(--height) - var(--button)) / 2 + 4px);
	}

	.bar.vertical .apps {
		flex-direction: column;
	}

	.bar.vertical.aligned .apps {
		top: calc(var(--height) / 4);
		transform: translate(-50%, 0);
	}

	.slot {
		position: relative;
		display: grid;
		width: var(--button);
		height: var(--button);
		place-items: center;
		border-radius: var(--slot-radius);
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

	.top .dot {
		top: 0;
		bottom: auto;
	}

	.vertical .dot {
		top: 50%;
		bottom: auto;
		transform: translateY(-50%);
	}

	.left .dot {
		left: 0;
	}

	.right .dot {
		right: 0;
		left: auto;
	}

	.vertical .focused .dot {
		width: 3px;
		height: 8px;
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

	.stacked {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 7.5px;
		line-height: 1.2;
	}

	.vertical .status {
		top: auto;
		right: auto;
		bottom: calc(var(--height) / 4);
		left: 50%;
		flex-wrap: wrap;
		justify-content: center;
		gap: 3px;
		width: var(--button);
		transform: translateX(-50%);
		font-size: 8px;
		text-align: center;
	}

	.vertical .time {
		margin-left: 0;
	}

	.bar.separate {
		background: transparent;
		backdrop-filter: none;
	}

	.bar.separate .apps,
	.bar.separate .status {
		box-sizing: border-box;
		padding: calc((var(--height) - var(--button)) / 2);
		border-radius: calc(var(--slot-radius) + (var(--height) - var(--button)) / 2);
		background: var(--surface);
		backdrop-filter: var(--backdrop);
	}

	.bar.separate .status {
		right: 0;
		height: var(--height);
		padding-inline: calc(var(--height) / 3);
	}

	.bar.separate.aligned:not(.vertical) .apps {
		left: 0;
	}

	.bar.separate.vertical .status {
		bottom: 0;
		width: var(--height);
		height: auto;
		padding: calc(var(--height) / 3) 0;
	}

	.bar.separate.vertical.aligned .apps {
		top: 0;
	}
</style>
