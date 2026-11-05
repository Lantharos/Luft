<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import MonitorX from '@lucide/svelte/icons/monitor-x';
	import { ActionRow, Dialog, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Problem } from '#lib/bindings.js';
	import MoreRow, { COLLAPSED } from '#lib/components/MoreRow.svelte';

	const AFTERMATH: Record<Problem['restart'], string> = {
		graceful: 'settings-about-problem-graceful',
		forced: 'settings-about-problem-forced',
		emergency: 'settings-about-problem-emergency'
	};

	let when = $derived(new Intl.DateTimeFormat(i18n.formats, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
	let list = $state<Problem[]>([]);
	let open = $state<Problem | null>(null);
	let expanded = $state(false);
	let error = $state('');

	async function restart() {
		try {
			await commands.aboutFirmwareRestart();
		} catch (reason) {
			error = String(reason);
		}
	}

	commands.aboutProblems().then((loaded) => (list = loaded));
</script>

{#if list.length}
	<Section title={t('settings-about-problems')}>
		{#each expanded ? list : list.slice(0, COLLAPSED) as problem (problem.id)}
			<ActionRow
				icon={MonitorX}
				title={t('settings-about-problem-gpu')}
				description={t('settings-about-problem-summary', { when: when.format(problem.time * 1000) })}
				onclick={() => {
					error = '';
					open = problem;
				}}
			/>
		{/each}
		{#if list.length > COLLAPSED}
			<MoreRow hidden={list.length - COLLAPSED} bind:expanded />
		{/if}
	</Section>
{/if}

{#if open}
	{@const problem = open}
	<Dialog
		title={t('settings-about-problem-gpu')}
		description={t(AFTERMATH[problem.restart], { when: when.format(problem.time * 1000) })}
		wide
		onclose={() => (open = null)}
	>
		<div class="flex flex-col gap-5">
			{#if problem.suggestions.length}
				<div class="flex flex-col gap-3">
					<h3 class="text-[14px] font-semibold">{t('settings-about-problem-help')}</h3>
					{#each problem.suggestions as suggestion (suggestion.step)}
						<div class="flex flex-col gap-1">
							<span class="text-[13.5px] font-medium">{suggestion.step}</span>
							<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{suggestion.detail}</p>
						</div>
					{/each}
				</div>
			{/if}
			<div class="flex flex-col gap-2">
				<h3 class="text-[14px] font-semibold">{t('settings-about-problem-what')}</h3>
				{#if problem.graphics.length}
					<p class="text-[13px] text-[var(--text-muted)]">{problem.graphics.join(', ')}</p>
				{/if}
				<ul class="flex flex-col gap-1 font-mono text-[12px] leading-relaxed text-[var(--text-muted)]">
					{#each problem.evidence as line, index (index)}
						<li class="break-words">{line}</li>
					{/each}
				</ul>
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">
					{t('settings-about-problem-log')}
				</p>
			</div>
			{#if error}
				<p class="text-[13px] text-[var(--danger)]">{error}</p>
			{/if}
		</div>
		{#snippet actions()}
			{#if problem.suggestions.some((suggestion) => suggestion.action === 'firmware-settings')}
				<button type="button" class="button" onclick={restart}>{t('settings-about-problem-firmware')}</button>
			{/if}
			<button type="button" class="button primary" onclick={() => (open = null)}>{t('settings-about-done')}</button>
		{/snippet}
	</Dialog>
{/if}
