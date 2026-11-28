<script lang="ts">
	import { onMount } from 'svelte';
	import Lock from '@luft/symbols/icons/lock';
	import ShieldCheck from '@luft/symbols/icons/shield-check';
	import { t } from '@luft/i18n';
	import { commands } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { setup } from '#lib/state/setup.svelte.js';

	let left = $state(false);
	let problem = $state('');

	let facts = $derived(
		[
			{ icon: ShieldCheck, title: t('setup-handed-over-secure-boot'), holds: setup.trust?.secureBoot === 'on' && setup.trust.key === 'enrolled' },
			{ icon: Lock, title: t('setup-handed-over-sealed'), holds: setup.trust?.sealed ?? false }
		].filter((fact) => fact.holds)
	);

	async function shutDown() {
		problem = '';
		await commands.sessionShutDown(WAIT_FOR_PERSON).catch((error) => (problem = String(error)));
	}

	onMount(() => {
		void commands
			.installerLeaveToOwner(WAIT_FOR_PERSON)
			.then(() => (left = true))
			.catch((error) => (problem = String(error)));
	});
</script>

<StepFrame title={t('setup-handed-over-title')} description={t('setup-handed-over-description')}>
	<ul class="flex flex-col gap-1">
		{#each facts as fact (fact.title)}
			<li class="flex items-center gap-4 px-1 py-2.5">
				<span class="grid h-10 w-10 flex-none place-items-center rounded-full bg-[var(--surface)] text-[var(--text-soft)]"><fact.icon size={19} /></span>
				<span class="text-[15px] font-medium">{fact.title}</span>
			</li>
		{/each}
	</ul>
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary large px-6" disabled={!left} onclick={shutDown}>{t('setup-shut-down')}</button>
	{/snippet}
</StepFrame>
