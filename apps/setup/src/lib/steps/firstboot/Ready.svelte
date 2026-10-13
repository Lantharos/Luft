<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { finishFirstBoot } from '#lib/api/installer.js';
	import { finishSetup, restart } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { setup } from '#lib/state/setup.svelte.js';

	let busy = $state(false);
	let problem = $state('');

	async function finish() {
		busy = true;
		problem = '';
		try {
			await finishFirstBoot();
			if (setup.needsRestart) await restart();
			else if (!(await finishSetup())) await appWindow.close();
		} catch (error) {
			problem = String(error);
			busy = false;
		}
	}
</script>

<StepFrame
	title="You’re all set"
	description={setup.needsRestart ? 'Restart once more to finish, then sign in with your password.' : 'Your desktop is ready. Have fun with Luft.'}
>
	{#if problem}
		<p class="text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary large px-6" disabled={busy} onclick={finish}>
			{setup.needsRestart ? 'Restart' : 'Start using Luft'}
		</button>
	{/snippet}
</StepFrame>
