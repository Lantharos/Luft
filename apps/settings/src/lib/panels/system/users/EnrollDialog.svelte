<script lang="ts">
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import { onDestroy, untrack } from 'svelte';
	import { Dialog, Select } from '@luft/ui';
	import { enroll, onEnrollProgress, stopEnrolling } from './api';
	import { fingerLabel, progressMessage } from './fingers';

	interface Props {
		fingers: (readonly [string, string])[];
		swipe: boolean;
		stages: number;
		onclose: () => void;
	}

	type Phase = 'choosing' | 'scanning' | 'added' | 'failed';

	const RING = 2 * Math.PI * 54;

	let { fingers, swipe, stages, onclose }: Props = $props();

	let finger = $state(untrack(() => fingers[0][0]));
	let phase = $state<Phase>('choosing');
	let passed = $state(0);
	let message = $state('');
	let stop: (() => void) | null = null;

	let options = $derived(fingers.map(([value, label]) => ({ value, label })));
	let progress = $derived(phase === 'added' ? 1 : stages > 0 ? Math.min(passed / stages, 1) : 0);
	let instruction = $derived(`${swipe ? 'Swipe' : 'Place'} your ${fingerLabel(finger).toLowerCase()} ${swipe ? 'across' : 'on'} the sensor.`);

	async function start() {
		phase = 'scanning';
		passed = 0;
		message = instruction;
		stop ??= onEnrollProgress(({ result, done }) => {
			if (result === 'enroll-stage-passed') passed += 1;
			message = progressMessage(result, swipe);
			if (done) phase = result === 'enroll-completed' ? 'added' : 'failed';
		});
		try {
			await enroll(finger);
		} catch (reason) {
			phase = 'failed';
			message = reason instanceof Error ? reason.message : String(reason);
		}
	}

	function close() {
		if (phase === 'scanning') void stopEnrolling();
		onclose();
	}

	onDestroy(() => stop?.());
</script>

<Dialog title="Add a fingerprint" description={phase === 'choosing' ? 'Choose which finger to add.' : undefined} onclose={close}>
	{#if phase === 'choosing'}
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px] text-[var(--text-soft)]">Finger</span>
			<Select label="Finger" {options} value={finger} onchange={(next) => (finger = next)} />
		</div>
	{:else}
		<div class="flex flex-col items-center gap-4 py-2">
			<div class="dial" class:done={phase === 'added'} class:failed={phase === 'failed'}>
				<svg viewBox="0 0 120 120" aria-hidden="true">
					<circle class="track" cx="60" cy="60" r="54" />
					<circle class="fill" cx="60" cy="60" r="54" stroke-dasharray={RING} stroke-dashoffset={RING * (1 - progress)} />
				</svg>
				<Fingerprint size={44} strokeWidth={1.5} />
			</div>
			<p class="min-h-[40px] text-center text-[14px] leading-snug" aria-live="polite">{message}</p>
		</div>
	{/if}
	{#snippet actions()}
		{#if phase === 'choosing'}
			<button type="button" class="button" onclick={close}>Cancel</button>
			<button type="button" class="button primary" onclick={start}>Start</button>
		{:else if phase === 'scanning'}
			<button type="button" class="button" onclick={close}>Cancel</button>
		{:else if phase === 'failed'}
			<button type="button" class="button" onclick={close}>Close</button>
			<button type="button" class="button primary" onclick={start}>Try again</button>
		{:else}
			<button type="button" class="button primary" onclick={close}>Done</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.dial {
		position: relative;
		display: grid;
		height: 120px;
		width: 120px;
		place-items: center;
		color: var(--text-soft);
	}

	.dial svg {
		position: absolute;
		inset: 0;
		transform: rotate(-90deg);
	}

	circle {
		fill: none;
		stroke-width: 5;
		stroke-linecap: round;
	}

	.track {
		stroke: var(--control);
	}

	.fill {
		stroke: var(--accent);
		transition: stroke-dashoffset 400ms var(--ease), stroke 200ms var(--ease);
	}

	.done {
		color: var(--success);
	}

	.done .fill {
		stroke: var(--success);
	}

	.failed .fill {
		stroke: var(--danger);
	}
</style>
