<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import { t } from '@luft/i18n';
	import { formatClock, IconButton } from '@luft/ui';
	import { editor, SCRUB_DELAY } from '#lib/state/editor.svelte.js';

	interface Props {
		tall: boolean;
	}

	let { tall }: Props = $props();

	const height = $derived(tall ? 200 : 56);

	let track = $state<HTMLDivElement>();
	let waveform = $state<HTMLCanvasElement>();
	let player = $state<HTMLAudioElement>();
	let playing = $state(false);
	let playable = $state(true);
	let dragging: 'start' | 'end' | 'head' | null = null;
	let baseline = '';
	let timer: ReturnType<typeof setTimeout> | undefined;

	const start = $derived(editor.edits.trim?.start ?? 0);
	const end = $derived(editor.edits.trim?.end ?? editor.duration);

	const percent = (value: number) => `${(value / Math.max(editor.duration, 0.001)) * 100}%`;

	function scrub(time: number) {
		editor.time = time;
		clearTimeout(timer);
		if (editor.file?.family !== 'video') return;
		timer = setTimeout(() => void editor.loadFrame(Math.round(time * 10) / 10), SCRUB_DELAY);
	}

	function togglePlaying() {
		if (!player) return;
		if (playing) return player.pause();
		player.currentTime = editor.time >= start && editor.time < end ? editor.time : start;
		void player.play();
	}

	function follow() {
		if (!player) return;
		editor.time = player.currentTime;
		if (player.currentTime >= end) player.pause();
	}

	function timeAt(event: PointerEvent) {
		const box = track!.getBoundingClientRect();
		return Math.max(0, Math.min(editor.duration, ((event.clientX - box.left) / box.width) * editor.duration));
	}

	function setTrim(nextStart: number, nextEnd: number) {
		const whole = nextStart <= 0 && nextEnd >= editor.duration;
		editor.edits.trim = whole ? null : { start: nextStart, end: nextEnd };
	}

	function grab(event: PointerEvent, what: 'start' | 'end' | 'head') {
		event.stopPropagation();
		dragging = what;
		baseline = JSON.stringify(editor.edits);
		track!.setPointerCapture(event.pointerId);
	}

	function move(event: PointerEvent) {
		if (!dragging) return;
		const time = timeAt(event);
		if (dragging === 'start') setTrim(Math.min(time, end - 0.05), end);
		if (dragging === 'end') setTrim(start, Math.max(time, start + 0.05));
		scrub(time);
	}

	function release() {
		if (dragging && dragging !== 'head') editor.commit(baseline);
		dragging = null;
	}

	function nudge(event: KeyboardEvent, what: 'start' | 'end') {
		const step = event.shiftKey ? 1 : 0.1;
		const change = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
		if (!change) return;
		event.preventDefault();
		event.stopPropagation();
		const before = JSON.stringify(editor.edits);
		if (what === 'start') setTrim(Math.max(0, Math.min(start + change, end - 0.05)), end);
		else setTrim(start, Math.min(editor.duration, Math.max(end + change, start + 0.05)));
		editor.commit(before);
		scrub(what === 'start' ? start : end);
	}

	$effect(() => {
		if (!waveform || !editor.peaks.length) return;
		const ratio = window.devicePixelRatio;
		const width = waveform.clientWidth * ratio;
		waveform.width = width;
		waveform.height = height * ratio;
		const context = waveform.getContext('2d')!;
		context.fillStyle = getComputedStyle(waveform).color;
		const step = width / editor.peaks.length;
		const middle = (height * ratio) / 2;
		editor.peaks.forEach((peak, index) => {
			const reach = Math.max(1, peak * middle);
			context.fillRect(index * step, middle - reach, Math.max(1, step - 1), reach * 2);
		});
	});
</script>

<div class="px-4 pb-3 pt-2">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={track}
		class="track"
		style:height="{height}px"
		onpointerdown={(event) => {
			grab(event, 'head');
			scrub(timeAt(event));
		}}
		onpointermove={move}
		onpointerup={release}
	>
		<canvas bind:this={waveform} class="absolute inset-0 h-full w-full text-[var(--text-muted)]"></canvas>
		<div class="shade left-0" style:width={percent(start)}></div>
		<div class="shade right-0" style:width={percent(editor.duration - end)}></div>
		<div class="head" style:left={percent(editor.time)}></div>
		<button
			type="button"
			class="handle"
			style:left={percent(start)}
			aria-label={t('edit-trim-start', { time: formatClock(start) })}
			onpointerdown={(event) => grab(event, 'start')}
			onkeydown={(event) => nudge(event, 'start')}
		></button>
		<button
			type="button"
			class="handle"
			style:left={percent(end)}
			aria-label={t('edit-trim-end', { time: formatClock(end) })}
			onpointerdown={(event) => grab(event, 'end')}
			onkeydown={(event) => nudge(event, 'end')}
		></button>
	</div>
	<div class="mt-1 flex items-center justify-between text-[12px] tabular-nums text-[var(--text-muted)]">
		<span class="flex-1">{formatClock(start)}</span>
		{#if playable && editor.peaks.length}
			<IconButton icon={playing ? Pause : Play} label={playing ? t('edit-pause') : t('edit-play')} onclick={togglePlaying} />
		{/if}
		<span class="px-2">{t('edit-trim-length', { time: formatClock(end - start) })}</span>
		<span class="flex-1 text-right">{formatClock(end)}</span>
	</div>
	{#if editor.file}
		<audio
			bind:this={player}
			src={fileUrl(editor.file.path)}
			preload="none"
			onplay={() => (playing = true)}
			onpause={() => (playing = false)}
			ontimeupdate={follow}
			onerror={() => (playable = false)}
		></audio>
	{/if}
</div>

<style>
	.track {
		position: relative;
		border-radius: 10px;
		background: var(--surface);
		overflow: hidden;
		touch-action: none;
		cursor: pointer;
	}

	.shade {
		position: absolute;
		top: 0;
		bottom: 0;
		background: color-mix(in oklab, var(--app-bg) 72%, transparent);
	}

	.head {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--text);
		pointer-events: none;
	}

	.handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 12px;
		margin-left: -6px;
		border-radius: 4px;
		background: var(--accent);
		cursor: ew-resize;
	}

	.handle:focus-visible {
		outline: 2px solid var(--control-focus);
		outline-offset: 1px;
	}
</style>
