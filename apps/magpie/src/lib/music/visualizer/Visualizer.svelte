<script lang="ts">
	import { appearance, motionPreference } from '@luft/ui';
	import { onMount } from 'svelte';
	import { chrome } from '#lib/app/chrome.svelte.js';
	import { player } from '../player.svelte';
	import { accentPalette, coverPalette, PALETTE_SIZE } from './palette';
	import { Renderer, type Scene } from './renderer';
	import { visualizer } from './settings.svelte';
	import { spectrum } from './spectrum';

	const CALM_STEP_MS = 250;
	const BLEND_PER_SECOND = 2.4;
	const SETTLED = 0.002;
	const MAX_STEP_SECONDS = 0.1;

	let canvas: HTMLCanvasElement;
	let renderer: Renderer;
	let cancel: (() => void) | null = null;
	let last = 0;
	let calm = false;
	let primed = false;
	let target: Float32Array = new Float32Array(PALETTE_SIZE * 3);

	const scene: Scene = {
		style: visualizer.style,
		time: 0,
		center: [0, 0],
		cover: [0, 0],
		colors: new Float32Array(PALETTE_SIZE * 3),
		energy: spectrum.energy,
		bands: spectrum.bands,
		strength: 1,
		scale: 1
	};

	onMount(() => {
		renderer = new Renderer(canvas);
		spectrum.listen(player.decks);
		const sizes = new ResizeObserver(([entry]) => {
			const [box] = entry.devicePixelContentBoxSize;
			renderer.resize(box.inlineSize, box.blockSize);
			measure();
		});
		sizes.observe(canvas, { box: 'device-pixel-content-box' });
		return () => {
			sizes.disconnect();
			stopLoop();
			spectrum.stop();
			renderer.destroy();
		};
	});

	$effect(() => {
		const cover = visualizer.cover;
		if (!cover) return;
		const moves = new ResizeObserver(measure);
		moves.observe(cover);
		return () => moves.disconnect();
	});

	$effect(() => {
		const art = player.track?.art;
		let current = true;
		const palette = art ? coverPalette(art).catch(() => accentPalette()) : Promise.resolve(accentPalette());
		void palette.then((colors) => {
			if (!current) return;
			if (!primed) scene.colors.set(colors);
			primed = true;
			target = colors;
			wake();
		});
		return () => (current = false);
	});

	$effect(() => {
		scene.style = visualizer.style;
		scene.strength = appearance.scheme === 'dark' || chrome.fullscreen ? 1 : 0.62;
		void player.playing;
		wake();
	});

	function measure() {
		const cover = visualizer.cover;
		const scale = devicePixelRatio;
		const bounds = canvas.getBoundingClientRect();
		scene.scale = scale;
		if (cover) {
			const box = cover.getBoundingClientRect();
			scene.center = [(box.left + box.width / 2 - bounds.left) * scale, (box.top + box.height / 2 - bounds.top) * scale];
			scene.cover = [(box.width / 2) * scale, parseFloat(getComputedStyle(cover).borderTopLeftRadius) * scale];
		} else {
			scene.center = [(bounds.width / 2) * scale, (bounds.height / 2) * scale];
			scene.cover = [0, 0];
		}
		wake();
	}

	function frame(now: number) {
		cancel = null;
		const seconds = Math.min(MAX_STEP_SECONDS, (now - last) / 1000);
		last = now;
		const playing = player.playing;
		const moving = spectrum.update(seconds, playing, calm);
		const blending = blend(seconds);
		if (playing) scene.time += seconds * (calm ? 0.04 : 0.35 + spectrum.energy[0] * 0.9);
		if (primed) renderer.draw(scene);
		if (playing || moving || blending) schedule();
	}

	function blend(seconds: number) {
		const amount = calm ? 1 : 1 - Math.exp(-BLEND_PER_SECOND * seconds);
		let blending = false;
		scene.colors.forEach((value, index) => {
			const gap = target[index] - value;
			scene.colors[index] = value + gap * amount;
			blending ||= Math.abs(gap) > SETTLED;
		});
		return blending;
	}

	function wake() {
		if (cancel || !renderer || document.hidden) return;
		calm = motionPreference() !== 'full';
		last = performance.now();
		schedule();
	}

	function schedule() {
		if (calm) {
			const timer = setTimeout(() => frame(performance.now()), CALM_STEP_MS);
			cancel = () => clearTimeout(timer);
		} else {
			const request = requestAnimationFrame(frame);
			cancel = () => cancelAnimationFrame(request);
		}
	}

	function stopLoop() {
		cancel?.();
		cancel = null;
	}

	function visibilityChanged() {
		if (document.hidden) stopLoop();
		else wake();
	}
</script>

<svelte:document onvisibilitychange={visibilityChanged} />

<canvas bind:this={canvas} class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
