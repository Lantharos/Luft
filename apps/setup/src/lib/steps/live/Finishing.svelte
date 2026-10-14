<script lang="ts">
	import { restart, finishSetup } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
	import { install } from '#lib/state/install.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	const STAGES: Record<string, string> = {
		idle: 'Getting ready',
		preparing: 'Making room for Luft',
		copying: 'Copying Luft',
		waiting: 'Finishing up',
		configuring: 'Setting up your account',
		finished: 'Done'
	};

	let status = $derived(install.status);
	let code = $derived(status?.secureBootCode ?? '');
	let percent = $derived(Math.round((status?.progress ?? 0) * 100));
	let problem = $state('');

	async function restartNow() {
		problem = '';
		await restart().catch((error) => (problem = String(error)));
	}
</script>

{#if install.failed}
	<StepFrame title="Luft couldn’t be installed" description={status?.error || 'Something went wrong while installing.'}>
		<p class="max-w-[540px] text-[14px] leading-relaxed text-[var(--text-soft)]">
			Your computer still starts the way it did before. You can keep using Luft from the USB stick, or restart and try again.
		</p>
		{#snippet actions()}
			<button type="button" class="plain-button large" onclick={() => finishSetup()}>Use Luft from the stick</button>
			<button type="button" class="button large px-6" onclick={restartNow}>Restart</button>
		{/snippet}
	</StepFrame>
{:else if install.finished && code}
	<StepFrame
		title="Luft is installed"
		description="Take out the USB stick once the screen goes dark. A blue screen then asks to trust Luft. Use the keyboard there."
	>
		<EnrollSteps {code} />
		{#if problem}
			<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button primary large px-6" onclick={restartNow}>Restart now</button>
		{/snippet}
	</StepFrame>
{:else if install.finished}
	<StepFrame title="Luft is installed" description="Restart to start using it. Take out the USB stick once the screen goes dark.">
		{#if problem}
			<p class="text-[13.5px] text-[var(--danger)]">{problem}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button primary large px-6" onclick={restartNow}>Restart now</button>
		{/snippet}
	</StepFrame>
{:else}
	<StepFrame title="Almost there" description="Luft is being copied to your computer. This takes a few minutes.">
		<div class="flex max-w-[540px] flex-col gap-3 pt-6">
			<div class="flex items-baseline justify-between text-[15px]">
				<span class="font-medium">{STAGES[status?.stage ?? 'idle']}</span>
				<span class="text-[var(--text-muted)] tabular-nums">{percent}%</span>
			</div>
			<div class="h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
				<div class="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500" style:width="{percent}%"></div>
			</div>
			{#if setup.hardware.portable && setup.hardware.onBattery}
				<p class="mt-2 text-[13.5px] text-[var(--text-soft)]">Keep your computer plugged in until it’s done.</p>
			{/if}
		</div>
	</StepFrame>
{/if}
