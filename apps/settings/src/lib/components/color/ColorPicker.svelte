<script lang="ts">
	import { t } from '@luft/i18n';
	import { Popover, Slider } from '@luft/ui';
	import { untrack } from 'svelte';
	import { oklchOf, rgbOf, toHex } from './oklch';

	interface Props {
		anchor: HTMLElement;
		label: string;
		color: string;
		/** Keeps every color at this lightness, so only hue and saturation are picked. */
		lightness?: number;
		chroma: { min: number; max: number };
		onpick: (color: string) => void;
		onclose: () => void;
	}

	let { anchor, label, color, lightness: fixed, chroma: range, onpick, onclose }: Props = $props();

	const WIDTH = 264;
	const HEIGHT = 132;
	const HUE_STEP = 4;
	const CHROMA_STEP = 0.01;
	const LIGHTNESS = { min: 0.25, max: 0.95 };

	const initial = untrack(() => oklchOf(color));
	let hue = $state(initial.hue);
	let chroma = $state(untrack(() => Math.min(range.max, Math.max(range.min, initial.chroma))));
	let lightness = $state(untrack(() => fixed ?? Math.min(LIGHTNESS.max, Math.max(LIGHTNESS.min, initial.lightness))));
	let dragging = $state(false);
	let canvas = $state<HTMLCanvasElement>();

	const picked = $derived(toHex(rgbOf({ lightness, chroma, hue })));
	const x = $derived((hue / 360) * WIDTH);
	const y = $derived(((range.max - chroma) / (range.max - range.min)) * HEIGHT);

	$effect(() => {
		if (!canvas) return;
		const scale = window.devicePixelRatio;
		const [width, height] = [Math.round(WIDTH * scale), Math.round(HEIGHT * scale)];
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d')!;
		const image = context.createImageData(width, height);
		for (let row = 0; row < height; row++) {
			const rowChroma = range.max - (row / (height - 1)) * (range.max - range.min);
			for (let column = 0; column < width; column++) {
				const [r, g, b] = rgbOf({ lightness, chroma: rowChroma, hue: (column / (width - 1)) * 360 });
				image.data.set([r, g, b, 255], (row * width + column) * 4);
			}
		}
		context.putImageData(image, 0, 0);
	});

	function follow(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		hue = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) * 360;
		chroma = range.max - Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)) * (range.max - range.min);
	}

	function press(event: PointerEvent) {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = true;
		follow(event);
	}

	function release() {
		if (!dragging) return;
		dragging = false;
		onpick(picked);
	}

	function step(event: KeyboardEvent) {
		const moves: Record<string, () => void> = {
			ArrowLeft: () => (hue = (hue - HUE_STEP + 360) % 360),
			ArrowRight: () => (hue = (hue + HUE_STEP) % 360),
			ArrowUp: () => (chroma = Math.min(range.max, chroma + CHROMA_STEP)),
			ArrowDown: () => (chroma = Math.max(range.min, chroma - CHROMA_STEP))
		};
		const move = moves[event.key];
		if (!move) return;
		event.preventDefault();
		move();
		onpick(picked);
	}
</script>

<Popover {anchor} {label} role="dialog" {onclose}>
	<div class="flex flex-col gap-3 p-2" style:width="{WIDTH + 16}px">
		<div
			class="plane"
			style:width="{WIDTH}px"
			style:height="{HEIGHT}px"
			role="slider"
			tabindex="0"
			aria-label={label}
			aria-valuenow={Math.round(hue)}
			aria-valuemin={0}
			aria-valuemax={360}
			aria-valuetext={picked}
			onpointerdown={press}
			onpointermove={(event) => dragging && follow(event)}
			onpointerup={release}
			onpointercancel={release}
			onkeydown={step}
		>
			<canvas bind:this={canvas} style:width="{WIDTH}px" style:height="{HEIGHT}px"></canvas>
			<span class="thumb" style:left="{x}px" style:top="{y}px" style:background={picked}></span>
		</div>
		{#if fixed === undefined}
			<Slider
				label={t('settings-color-lightness')}
				min={LIGHTNESS.min}
				max={LIGHTNESS.max}
				step={0.01}
				value={lightness}
				oninput={(value) => (lightness = value)}
				onchange={(value) => {
					lightness = value;
					onpick(picked);
				}}
			/>
		{/if}
	</div>
</Popover>

<style>
	.plane {
		position: relative;
		cursor: crosshair;
		touch-action: none;
		border-radius: 10px;
		outline: none;
	}

	.plane canvas {
		display: block;
		border-radius: 10px;
	}

	.plane:focus-visible {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--accent);
	}

	.thumb {
		position: absolute;
		width: 18px;
		height: 18px;
		margin: -9px 0 0 -9px;
		border-radius: 999px;
		box-shadow: 0 0 0 2px #fff, 0 1px 4px rgb(0 0 0 / 0.35);
		pointer-events: none;
	}
</style>
