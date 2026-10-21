<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { finishFirstBoot } from '#lib/bridge/installer.js';
	import { finishSetup, restart } from '#lib/bridge/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
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
	title={t('setup-ready-title')}
	description={t(setup.secureBootCode ? 'setup-ready-trust' : setup.needsRestart ? 'setup-ready-restart' : 'setup-ready-done')}
>
	{#if setup.secureBootCode}
		<EnrollSteps code={setup.secureBootCode} />
	{/if}
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary large px-6" disabled={busy} onclick={finish}>
			{t(setup.needsRestart ? 'setup-restart' : 'setup-ready-start')}
		</button>
	{/snippet}
</StepFrame>
