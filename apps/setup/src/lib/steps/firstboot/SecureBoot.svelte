<script lang="ts">
	import { enrollKey, restart } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let pointer = $derived(setup.hardware.touchpad ? 'touchpad' : 'mouse');
	let code = $state('');
	let busy = $state(false);
	let problem = $state('');

	async function getCode() {
		busy = true;
		problem = '';
		try {
			code = await enrollKey();
		} catch (error) {
			problem = String(error);
		} finally {
			busy = false;
		}
	}

	async function restartNow() {
		problem = '';
		await restart().catch((error) => (problem = String(error)));
	}
</script>

<StepFrame
	title="Your computer doesn’t trust Luft yet"
	description="The blue screen was skipped at the restart. Get a new code and restart to see it again. Use the arrow keys and Enter there, since the {pointer} doesn’t work on it."
>
	<EnrollSteps {code} />
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => flow.next()}>Not now</button>
		{#if code}
			<button type="button" class="button primary large px-6" onclick={restartNow}>Restart now</button>
		{:else}
			<button type="button" class="button primary large px-6" disabled={busy} onclick={getCode}>{busy ? 'Getting your code…' : 'Get a new code'}</button>
		{/if}
	{/snippet}
</StepFrame>
