<script lang="ts">
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import type { FingerprintEnrollment } from './fingerprint.svelte';

	interface Props {
		enrollment: FingerprintEnrollment;
	}

	const RING = 2 * Math.PI * 54;

	let { enrollment }: Props = $props();
</script>

<div class="flex flex-col items-center gap-4 py-2">
	<div class="dial" class:done={enrollment.phase === 'added'} class:failed={enrollment.phase === 'failed'}>
		<svg viewBox="0 0 120 120" aria-hidden="true">
			<circle class="track" cx="60" cy="60" r="54" />
			<circle class="fill" cx="60" cy="60" r="54" stroke-dasharray={RING} stroke-dashoffset={RING * (1 - enrollment.progress)} />
		</svg>
		<Fingerprint size={44} strokeWidth={1.5} />
	</div>
	<p class="min-h-[40px] text-center text-[14px] leading-snug" aria-live="polite">{enrollment.message}</p>
</div>

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
		transition:
			stroke-dashoffset 400ms var(--ease),
			stroke 200ms var(--ease);
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
