<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import Settings from '@lucide/svelte/icons/settings';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import { t } from '@luft/i18n';
	import { Spinner } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import EnrollSteps from '#lib/components/trust/EnrollSteps.svelte';
	import { setup } from '#lib/state/setup.svelte.js';

	let busy = $state(false);
	let problem = $state('');

	let secureBootLeft = $derived(setup.trust?.secureBoot === 'on' && setup.trust.key !== 'enrolled' && setup.trust.keyAvailable);

	let pointers = $derived([
		{ icon: LayoutGrid, title: t('setup-ready-start-title'), detail: t('setup-ready-start-detail') },
		{ icon: ShoppingBag, title: t('setup-ready-schelf-title'), detail: t('setup-ready-schelf-detail') },
		{ icon: Settings, title: t('setup-ready-settings-title'), detail: t(secureBootLeft ? 'setup-ready-settings-secure-boot' : 'setup-ready-settings-detail') }
	]);

	async function finish() {
		busy = true;
		problem = '';
		try {
			await commands.installerFinishFirstBoot(WAIT_FOR_PERSON);
			if (setup.secureBootCode) await commands.sessionRestart(WAIT_FOR_PERSON);
			else if (!(await commands.sessionFinish())) await appWindow.close();
		} catch (error) {
			problem = String(error);
			busy = false;
		}
	}
</script>

<StepFrame title={t('setup-ready-title')} description={t(setup.secureBootCode ? 'setup-ready-secure-boot' : 'setup-ready-done')}>
	{#if setup.secureBootCode}
		<EnrollSteps code={setup.secureBootCode} />
	{:else}
		<ul class="flex flex-col gap-1">
			{#each pointers as pointer (pointer.title)}
				<li class="flex items-center gap-4 px-1 py-2.5">
					<span class="grid h-10 w-10 flex-none place-items-center rounded-full bg-[var(--surface)] text-[var(--text-soft)]"><pointer.icon size={19} /></span>
					<span class="flex min-w-0 flex-col">
						<span class="text-[15px] font-medium">{pointer.title}</span>
						<span class="text-[13.5px] text-[var(--text-soft)]">{pointer.detail}</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary large px-6" disabled={busy} onclick={finish}>
			{#if busy}<Spinner />{/if}{t(setup.secureBootCode ? 'setup-restart' : 'setup-ready-start')}
		</button>
	{/snippet}
</StepFrame>
