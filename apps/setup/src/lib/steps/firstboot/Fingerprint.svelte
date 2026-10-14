<script lang="ts">
	import { onDestroy } from 'svelte';
	import FingerprintIcon from '@lucide/svelte/icons/fingerprint';
	import { FINGERS, FingerprintDial, FingerprintEnrollment, fingerprints, Select } from '@luft/ui';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';

	const OPTIONS = FINGERS.map(([value, label]) => ({ value, label }));

	let finger = $state<string>(FINGERS[0][0]);
	let enrollment = $state<FingerprintEnrollment | null>(null);
	let problem = $state('');

	let phase = $derived(enrollment?.phase ?? 'choosing');

	async function start() {
		problem = '';
		const reader = await fingerprints().catch(() => null);
		if (!reader) {
			problem = 'The fingerprint reader isn’t answering. You can add a fingerprint later in Settings.';
			return;
		}
		enrollment ??= new FingerprintEnrollment(reader);
		await enrollment.start(finger);
	}

	function skip() {
		enrollment?.cancel();
		flow.next();
	}

	onDestroy(() => enrollment?.destroy());
</script>

<StepFrame title="Sign in with your finger" description="Unlock Luft with a touch instead of typing your password. You can add more fingers later in Settings.">
	{#if phase === 'choosing'}
		<div class="flex items-center gap-4 text-[14px] leading-relaxed text-[var(--text-soft)]">
			<span class="grid h-14 w-14 flex-none place-items-center rounded-[18px] bg-[var(--accent-soft)] text-[var(--accent)]"><FingerprintIcon size={26} /></span>
			<div class="flex flex-1 items-center justify-between gap-4">
				<span>Which finger?</span>
				<Select label="Finger" options={OPTIONS} value={finger} onchange={(next) => (finger = next)} />
			</div>
		</div>
	{:else if enrollment}
		<FingerprintDial {enrollment} />
	{/if}
	{#if problem}
		<p class="mt-4 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		{#if phase === 'added'}
			<button type="button" class="button primary large px-6" onclick={() => flow.next()}>Continue</button>
		{:else}
			<button type="button" class="plain-button large" onclick={skip}>Not now</button>
			{#if phase === 'choosing'}
				<button type="button" class="button primary large px-6" onclick={start}>Add fingerprint</button>
			{:else if phase === 'failed'}
				<button type="button" class="button primary large px-6" onclick={start}>Try again</button>
			{/if}
		{/if}
	{/snippet}
</StepFrame>
