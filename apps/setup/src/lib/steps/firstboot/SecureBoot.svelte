<script lang="ts">
	import { enrollKey, restart } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import MokScreen from './MokScreen.svelte';

	const STEPS = [
		{ caption: 'Press any key within ten seconds', screen: { heading: 'Shim', items: [], prompt: 'Press any key to perform\nMOK management' } },
		{ caption: 'Choose Enroll MOK, then Continue', screen: { heading: 'Perform MOK management', items: ['Continue boot', 'Enroll MOK', 'Enroll key from disk', 'Enroll hash from disk'], highlighted: 1 } },
		{ caption: 'Choose Yes', screen: { heading: 'Enroll the key(s)?', items: ['No', 'Yes'], highlighted: 1 } },
		{ caption: 'Type your code, then choose Reboot', screen: { heading: 'Enroll MOK', items: [], prompt: 'Password:\n• • • • • • • •' } }
	];

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
	title="One more step for a safe start"
	description="Your computer only starts software it trusts. To trust Luft, it shows a blue screen once when it restarts. Here’s what to do there."
>
	<div class="flex flex-col gap-7">
		<ol class="grid grid-cols-4 gap-4">
			{#each STEPS as step, index (step.caption)}
				<li class="flex flex-col gap-2.5">
					<MokScreen {...step.screen} />
					<span class="text-[12.5px] leading-snug text-[var(--text-soft)]"><span class="font-semibold text-[var(--text)]">{index + 1}.</span> {step.caption}</span>
				</li>
			{/each}
		</ol>
		{#if code}
			<div class="flex items-center gap-5">
				<span class="font-mono text-[34px] font-semibold tracking-[0.12em] tabular-nums">{code.slice(0, 4)} {code.slice(4)}</span>
				<span class="max-w-[300px] text-[13.5px] leading-snug text-[var(--text-soft)]">Your code. You’ll see it again right before the restart.</span>
			</div>
		{/if}
		{#if problem}
			<p class="text-[13.5px] text-[var(--danger)]">{problem}</p>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => flow.next()}>Not now</button>
		{#if code}
			<button type="button" class="button primary large px-6" onclick={restartNow}>Restart now</button>
		{:else}
			<button type="button" class="button primary large px-6" disabled={busy} onclick={getCode}>{busy ? 'Getting your code…' : 'Get my code'}</button>
		{/if}
	{/snippet}
</StepFrame>
