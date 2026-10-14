<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { Dialog, FingerprintDial, FingerprintEnrollment, Select } from '@luft/ui';

	interface Props {
		fingers: (readonly [string, string])[];
		swipe: boolean;
		stages: number;
		onclose: () => void;
	}

	let { fingers, swipe, stages, onclose }: Props = $props();

	const enrollment = new FingerprintEnrollment(untrack(() => ({ swipe, stages })));
	let finger = $state(untrack(() => fingers[0][0]));

	let options = $derived(fingers.map(([value, label]) => ({ value, label })));

	function close() {
		enrollment.cancel();
		onclose();
	}

	onDestroy(() => enrollment.destroy());
</script>

<Dialog title="Add a fingerprint" description={enrollment.phase === 'choosing' ? 'Choose which finger to add.' : undefined} onclose={close}>
	{#if enrollment.phase === 'choosing'}
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px] text-[var(--text-soft)]">Finger</span>
			<Select label="Finger" {options} value={finger} onchange={(next) => (finger = next)} />
		</div>
	{:else}
		<FingerprintDial {enrollment} />
	{/if}
	{#snippet actions()}
		{#if enrollment.phase === 'choosing'}
			<button type="button" class="button" onclick={close}>Cancel</button>
			<button type="button" class="button primary" onclick={() => enrollment.start(finger)}>Start</button>
		{:else if enrollment.phase === 'scanning'}
			<button type="button" class="button" onclick={close}>Cancel</button>
		{:else if enrollment.phase === 'failed'}
			<button type="button" class="button" onclick={close}>Close</button>
			<button type="button" class="button primary" onclick={() => enrollment.start(finger)}>Try again</button>
		{:else}
			<button type="button" class="button primary" onclick={close}>Done</button>
		{/if}
	{/snippet}
</Dialog>
