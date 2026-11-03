<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, MARK_HEIGHT, MARK_LAYERS, MARK_WIDTH, tooltip, type GlassShading, type Shadow } from '@luft/ui';
	import {
		alongOf,
		edgeOf,
		isVerticalEdge,
		layIslands,
		mainEdge,
		moveBar,
		placeAlong,
		presentIn,
		spotTargets,
		type Arrangement,
		type Box,
		type Edge,
		type Spot
	} from '@luft/ui/taskbar';
	import BatteryFull from '@lucide/svelte/icons/battery-full';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Wifi from '@lucide/svelte/icons/wifi';
	import type { App } from '#lib/bindings.js';
	import type { AutoHide, Look, Size, Style } from '../options';
	import { Arranging, type Grip, type ShownIsland } from './arranging.svelte';
	import PreviewElement from './PreviewElement.svelte';

	interface Props {
		wallpaper: string | null;
		apps: App[];
		arrangement: Arrangement;
		look: Look;
		style: Style;
		size: Size;
		autoHide: AutoHide;
		shown: boolean;
		present: (element: string) => boolean;
		label: (element: string) => string;
		onarrange: (arrangement: Arrangement) => void;
	}

	let { wallpaper, apps, arrangement, look, style, size, autoHide, shown, present, label, onarrange }: Props = $props();

	const METRICS: Record<Size, { height: number; button: number; icon: number }> = {
		compact: { height: 26, button: 22, icon: 14 },
		normal: { height: 31, button: 26, icon: 18 },
		large: { height: 36, button: 31, icon: 22 }
	};
	const SCALE = 0.65;
	const FLOATING_MARGIN = 8;
	const TARGET_BUTTONS = 3;
	const REACH = 0.3;

	let width = $state(0);
	let height = $state(0);
	let screen = $state<HTMLDivElement>();
	let natural = $state<Record<string, { width: number; height: number }>>({});

	let metrics = $derived(METRICS[size]);
	let joined = $derived(style !== 'separate');
	let paint = $derived(appearance.taskbar?.[look]);
	let cornerPaint = $derived(appearance.taskbar?.glass);
	let inset = $derived(style === 'bar' ? metrics.height / 4 : (metrics.height - metrics.button) / 2);
	let margin = $derived(style === 'bar' ? 0 : FLOATING_MARGIN);
	let frame = $derived({ width, height, thickness: metrics.height, margin: FLOATING_MARGIN, rightToLeft: false });
	let targets = $derived(spotTargets(frame, metrics.height * TARGET_BUTTONS));

	const arranging = new Arranging(
		{
			arrangement: () => arrangement,
			islands: (): ShownIsland[] => islands,
			targets: () => targets,
			joined: () => joined,
			origin: () => screen!.getBoundingClientRect(),
			middles: (spot) => middles(spot),
			save: (next) => onarrange(next)
		},
		() => Math.min(width, height) * REACH
	);

	let shownArrangement: Arrangement = $derived(presentIn(arrangement, present));
	let laidOut: Arrangement = $derived(presentIn(arranging.draft ?? arrangement, present));
	let edge: Edge = $derived(mainEdge(laidOut));
	let groups: Arrangement = $derived(joined ? moveBar(laidOut, edge) : laidOut);
	let bar: Box = $derived(band(edge));
	let islands: ShownIsland[] = $derived(joined ? alongBar(groups) : onScreen(groups));
	let mainVertical = $derived(isVerticalEdge(edge));

	const keyOf = (elements: string[]) => elements.join(' ');
	const lengthOf = (elements: string[], vertical: boolean) => {
		const size = natural[keyOf(elements)];
		return size ? (vertical ? size.height : size.width) : 0;
	};

	function band(edge: Edge): Box {
		const thickness = metrics.height;
		switch (edge) {
			case 'bottom':
				return { x: margin, y: height - margin - thickness, width: width - 2 * margin, height: thickness };
			case 'top':
				return { x: margin, y: margin, width: width - 2 * margin, height: thickness };
			case 'left':
				return { x: margin, y: margin, width: thickness, height: height - 2 * margin };
			case 'right':
				return { x: width - margin - thickness, y: margin, width: thickness, height: height - 2 * margin };
		}
	}

	function alongBar(groups: Arrangement): ShownIsland[] {
		const vertical = isVerticalEdge(edge);
		const length = vertical ? bar.height : bar.width;
		const lengths = groups.map(({ elements }) => lengthOf(elements, vertical));
		const starts = placeAlong({ start: inset, end: length - inset }, groups.map(({ spot }, index) => ({ along: alongOf(spot), length: lengths[index] })), inset, length / 2);
		return groups.map(({ spot, elements }, index) => ({
			spot,
			elements,
			box: vertical
				? { x: bar.x, y: bar.y + starts[index], width: bar.width, height: lengths[index] }
				: { x: bar.x + starts[index], y: bar.y, width: lengths[index], height: bar.height }
		}));
	}

	function onScreen(groups: Arrangement): ShownIsland[] {
		const boxes = layIslands(
			groups.map(({ spot, elements }) => ({ spot, length: lengthOf(elements, isVerticalEdge(edgeOf(spot))) })),
			frame
		);
		return groups.map(({ spot, elements }) => ({ spot, elements, box: boxes.find((box) => box.spot === spot)! }));
	}

	function middles(spot: Spot) {
		const node = screen?.querySelector(`[data-spot="${spot}"]`);
		const origin = screen!.getBoundingClientRect();
		const vertical = isVerticalEdge(edgeOf(spot));
		return [...(node?.querySelectorAll<HTMLElement>('[data-element]') ?? [])].map((child) => {
			const box = child.getBoundingClientRect();
			return { element: child.dataset.element!, middle: vertical ? box.top - origin.top + box.height / 2 : box.left - origin.left + box.width / 2 };
		});
	}

	function boxIn(node: Element): Box {
		const box = node.getBoundingClientRect();
		const origin = screen!.getBoundingClientRect();
		return { x: box.left - origin.left, y: box.top - origin.top, width: box.width, height: box.height };
	}

	function measure(elements: string[]) {
		return (node: HTMLElement) => {
			const key = keyOf(elements);
			const observer = new ResizeObserver(() => {
				const { offsetWidth: width, offsetHeight: height } = node;
				if (natural[key]?.width !== width || natural[key]?.height !== height) natural[key] = { width, height };
			});
			observer.observe(node);
			return () => observer.disconnect();
		};
	}

	const px = (value: number) => `${value * SCALE}px`;
	const dropShadow = (shadow: Shadow | null) => (shadow ? `drop-shadow(${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${shadow.color})` : 'none');
	const textShadow = (shadow: Shadow | null) => (shadow ? `${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${shadow.color}` : 'none');
	const boxShadow = (shadow: Shadow | null) => (shadow ? `${px(shadow.x)} ${px(shadow.y)} ${px(shadow.blur)} ${px(shadow.spread)} ${shadow.color}` : 'none');
	const backdrop = (glass: GlassShading | null) =>
		glass ? `blur(14px) saturate(${glass.saturation}) contrast(${1 - glass.lift * 0.8}) brightness(${1 + glass.lift * 0.8 - glass.dim / 10})` : 'none';
	const gripOf = (island: ShownIsland): Grip => ({ island: shownArrangement.find((stored) => stored.elements.includes(island.elements[0]))?.spot ?? island.spot });
	const dragged = (island: ShownIsland) => {
		const grip = arranging.grip;
		return !!grip && 'island' in grip && island.elements.includes(shownArrangement.find((stored) => stored.spot === grip.island)?.elements[0] ?? '');
	};
	const islandLabel = (island: ShownIsland) => island.elements.map(label).join(', ');
</script>

<div
	class="screen"
	class:empty={!wallpaper}
	class:dragging={arranging.dragging}
	role="application"
	aria-label={t('settings-taskbar-preview')}
	bind:this={screen}
	bind:clientWidth={width}
	bind:clientHeight={height}
	onpointermove={(event) => arranging.move(event)}
	onpointerup={() => arranging.release()}
	onpointercancel={() => arranging.release()}
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
	style:--radius="{8 + (metrics.height - metrics.button) / 2}px"
	style:--pad="{(metrics.height - metrics.button) / 2}px"
>
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}

	{#if arranging.dragging}
		{#each targets as target (target.spot)}
			<span
				class="target"
				class:aimed={arranging.aimed === target.spot}
				style:left="{target.x}px"
				style:top="{target.y}px"
				style:width="{target.width}px"
				style:height="{target.height}px"
			></span>
		{/each}
	{/if}

	<div class="taskbar {edge}" class:gone={!shown} class:hides={autoHide === 'always' && !arranging.dragging}>
		{#if joined}
			<div class="bar" class:floating={style === 'floating'} style:left="{bar.x}px" style:top="{bar.y}px" style:width="{bar.width}px" style:height="{bar.height}px"></div>
		{/if}
		{#each islands as island (keyOf(island.elements))}
			{@const vertical = isVerticalEdge(edgeOf(island.spot))}
			<div
				class="island {edgeOf(island.spot)}"
				class:separate={!joined}
				class:vertical
				class:lifted={dragged(island)}
				data-spot={island.spot}
				style:left="{island.box.x}px"
				style:top="{island.box.y}px"
				style:width={vertical ? `${island.box.width}px` : null}
				style:height={vertical ? null : `${island.box.height}px`}
				style:translate={dragged(island) ? `${arranging.pointer.x - arranging.offset.x - island.box.x}px ${arranging.pointer.y - arranging.offset.y - island.box.y}px` : null}
				{@attach measure(island.elements)}
			>
				{#each island.elements as element (element)}
					<button
						type="button"
						class="element"
						class:ghost={arranging.grip && 'element' in arranging.grip && arranging.grip.element === element}
						data-element={element}
						aria-label={label(element)}
						{@attach tooltip(label(element))}
						onpointerdown={(event) => arranging.press(event, { element }, boxIn(event.currentTarget))}
						onkeydown={(event) => arranging.key(event, { element })}
					>
						<PreviewElement id={element} {vertical} {apps} button={metrics.button} icon={metrics.icon} mark={paint?.mark} />
					</button>
				{/each}
				<button
					type="button"
					class="handle {edgeOf(island.spot)}"
					aria-label={t('settings-taskbar-island', { parts: islandLabel(island) })}
					{@attach tooltip(t('settings-taskbar-island-move'))}
					onpointerdown={(event) => arranging.press(event, gripOf(island), island.box)}
					onkeydown={(event) => arranging.key(event, gripOf(island))}
				></button>
			</div>
		{/each}
	</div>

	{#if arranging.grip && 'element' in arranging.grip}
		{@const element = arranging.grip.element}
		<div class="carried island separate" style:left="{arranging.pointer.x - arranging.offset.x}px" style:top="{arranging.pointer.y - arranging.offset.y}px">
			<PreviewElement id={element} vertical={false} {apps} button={metrics.button} icon={metrics.icon} mark={paint?.mark} />
		</div>
	{/if}

	<div class="corner {edge}" class:vertical={mainVertical} class:shown={!shown} style:--surface={cornerPaint?.surface} style:--ink={cornerPaint?.ink}>
		{#if present('start')}
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
	</div>
</div>

<style>
	.screen {
		position: relative;
		overflow: hidden;
		aspect-ratio: 5 / 2;
		border-radius: 16px;
		background: var(--control);
		touch-action: none;
		user-select: none;
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.bottom {
		--out-x: 0;
		--out-y: 1;
	}

	.top {
		--out-x: 0;
		--out-y: -1;
	}

	.left {
		--out-x: -1;
		--out-y: 0;
	}

	.right {
		--out-x: 1;
		--out-y: 0;
	}

	.target {
		position: absolute;
		border-radius: 999px;
		background: color-mix(in oklab, white 14%, transparent);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			scale var(--spring-snappy-duration) var(--spring-snappy);
	}

	.target.aimed {
		background: color-mix(in oklab, white 34%, transparent);
		scale: 1.06;
	}

	.taskbar {
		position: absolute;
		inset: 0;
		pointer-events: none;
		transition:
			opacity var(--motion-tap) var(--ease-decelerate),
			translate var(--spring-snappy-duration) var(--spring-snappy);
	}

	.taskbar.gone {
		opacity: 0;
		translate: calc(var(--out-x) * 24px) calc(var(--out-y) * 24px);
	}

	.taskbar.hides {
		translate: calc(var(--out-x) * 48px) calc(var(--out-y) * 48px);
	}

	.screen:hover .taskbar.hides:not(.gone) {
		translate: none;
	}

	.bar,
	.island {
		position: absolute;
		transition:
			left var(--spring-snappy-duration) var(--spring-snappy),
			top var(--spring-snappy-duration) var(--spring-snappy),
			width var(--spring-snappy-duration) var(--spring-snappy),
			height var(--spring-snappy-duration) var(--spring-snappy),
			border-radius var(--spring-snappy-duration) var(--spring-snappy);
	}

	.bar {
		background: var(--surface);
		backdrop-filter: var(--backdrop);
	}

	.bar.floating {
		border-radius: var(--radius);
	}

	.island {
		display: flex;
		box-sizing: border-box;
		align-items: center;
		justify-content: center;
		gap: 2px;
		pointer-events: auto;
	}

	.island:not(.vertical) {
		width: max-content;
	}

	.island.vertical {
		height: max-content;
		flex-direction: column;
	}

	.island.separate {
		padding: var(--pad);
		border-radius: var(--radius);
		background: var(--surface);
		backdrop-filter: var(--backdrop);
	}

	.island.lifted {
		z-index: 2;
		transition: none;
		scale: 1.04;
	}

	.element {
		display: flex;
		border-radius: 8px;
		cursor: grab;
		transition: opacity var(--motion-tap) var(--ease-decelerate);
	}

	.element:focus-visible,
	.handle:focus-visible {
		outline: 2px solid white;
		outline-offset: 1px;
	}

	.element.ghost {
		opacity: 0.35;
	}

	.dragging .element {
		cursor: grabbing;
	}

	.handle {
		position: absolute;
		width: 22px;
		height: 12px;
		cursor: grab;
		opacity: 0;
		transition: opacity var(--motion-tap) var(--ease-decelerate);
	}

	.handle::after {
		position: absolute;
		inset: 4px 3px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.8);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
		content: '';
	}

	.island:hover .handle,
	.handle:focus-visible,
	.dragging .handle {
		opacity: 1;
	}

	.handle.bottom {
		bottom: 100%;
		left: calc(50% - 11px);
	}

	.handle.top {
		top: 100%;
		left: calc(50% - 11px);
	}

	.handle.left,
	.handle.right {
		top: calc(50% - 11px);
		width: 12px;
		height: 22px;
	}

	.handle.left {
		left: 100%;
	}

	.handle.right {
		right: 100%;
	}

	.handle.left::after,
	.handle.right::after {
		inset: 3px 4px;
	}

	.carried {
		z-index: 3;
		pointer-events: none;
		scale: 1.08;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
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
		color: var(--ink);
	}

	.pill.round {
		width: 23px;
		justify-content: center;
		padding: 0;
	}

	.mark {
		display: grid;
		place-items: center;
	}

	.mark svg {
		grid-area: 1 / 1;
	}
</style>
