<script lang="ts">
	import { t } from '@luft/i18n';
	import { commands } from '#lib/bindings.js';

	const BUCKETS = 240;
	const HEIGHT = 96;
	const NUDGE = 0.01;

	interface Props {
		sound: number;
		frames: number;
		start: number;
		end: number;
		onchange: (start: number, end: number) => void;
	}

	let { sound, frames, start, end, onchange }: Props = $props();

	let peaks = $state.raw<number[]>([]);
	let area = $state<HTMLDivElement>();
	let held = $state<'start' | 'end' | null>(null);

	$effect(() => {
		void commands.soundPeaks({ sound, buckets: BUCKETS }).then((loaded) => (peaks = loaded));
	});

	let path = $derived(
		peaks
			.map((peak, index) => {
				const height = Math.max(1, peak * HEIGHT);
				return `M${index + 0.5} ${(HEIGHT - height) / 2}v${height}`;
			})
			.join('')
	);

	const share = (frame: number) => frame / frames;

	function move(event: PointerEvent) {
		if (!held || !area) return;
		const box = area.getBoundingClientRect();
		const at = Math.round(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) * frames);
		if (held === 'start') onchange(Math.min(at, end - 1), end);
		else onchange(start, Math.max(at, start + 1));
	}

	function nudge(event: KeyboardEvent, handle: 'start' | 'end') {
		const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
		if (!direction) return;
		event.preventDefault();
		const step = Math.round(direction * NUDGE * frames);
		if (handle === 'start') onchange(Math.max(0, Math.min(start + step, end - 1)), end);
		else onchange(start, Math.min(frames, Math.max(end + step, start + 1)));
	}
</script>

<svelte:window onpointermove={move} onpointerup={() => (held = null)} />

<div class="wave" bind:this={area}>
	<svg viewBox="0 0 {BUCKETS} {HEIGHT}" preserveAspectRatio="none" aria-hidden="true"><path d={path} /></svg>
	<div class="cut" style:left="0" style:width="{share(start) * 100}%"></div>
	<div class="cut" style:right="0" style:width="{(1 - share(end)) * 100}%"></div>
	{#each [['start', start, t('editor-trim-start')], ['end', end, t('editor-trim-end')]] as const as [handle, frame, label]}
		<button
			type="button"
			class="handle"
			style:left="{share(frame) * 100}%"
			role="slider"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={frames}
			aria-valuenow={frame}
			onpointerdown={() => (held = handle)}
			onkeydown={(event) => nudge(event, handle)}
		></button>
	{/each}
</div>

<style>
	.wave {
		position: relative;
		height: 96px;
		touch-action: none;
		overflow: hidden;
		border-radius: var(--radius-field, 10px);
		background: var(--control, color-mix(in oklab, var(--text) 7%, transparent));
	}

	svg {
		height: 100%;
		width: 100%;
	}

	path {
		stroke: var(--accent);
		stroke-width: 0.7;
		vector-effect: non-scaling-stroke;
		fill: none;
	}

	.cut {
		position: absolute;
		inset-block: 0;
		pointer-events: none;
		background: color-mix(in oklab, var(--content) 72%, transparent);
	}

	.handle {
		position: absolute;
		inset-block: 0;
		width: 14px;
		margin-left: -7px;
		cursor: ew-resize;
	}

	.handle::after {
		content: '';
		position: absolute;
		inset-block: 0;
		left: 6px;
		width: 2px;
		background: var(--text);
	}
</style>
