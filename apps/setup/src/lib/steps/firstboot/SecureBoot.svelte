<script lang="ts">
	import { enrollKey, restart } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let busy = $state(false);
	let problem = $state('');

	async function getCode() {
		busy = true;
		problem = '';
		try {
			setup.secureBootCode = await enrollKey();
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
	description={setup.secureBootCode
		? 'Right after the next restart, a blue screen asks to trust Luft. Use the keyboard there with this code.'
		: 'The blue screen was skipped. Get a new code and restart, then use the keyboard there.'}
>
	<EnrollSteps code={setup.secureBootCode} />
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		{#if setup.secureBootCode}
			<button type="button" class="plain-button large" onclick={() => flow.next()}>Restart later</button>
			<button type="button" class="button primary large px-6" onclick={restartNow}>Restart now</button>
		{:else}
			<button type="button" class="plain-button large" disabled={busy} onclick={() => flow.next()}>Not now</button>
			<button type="button" class="button primary large px-6" disabled={busy} onclick={getCode}>{busy ? 'Getting your code…' : 'Get a new code'}</button>
		{/if}
	{/snippet}
</StepFrame>
