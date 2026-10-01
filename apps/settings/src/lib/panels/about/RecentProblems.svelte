<script lang="ts">
	import MonitorX from '@lucide/svelte/icons/monitor-x';
	import { ActionRow, Dialog, Section } from '@luft/ui';
	import MoreRow, { COLLAPSED } from '$lib/components/MoreRow.svelte';
	import { problems, restartToFirmware, type Problem } from './api';

	const AFTERMATH: Record<Problem['restart'], string> = {
		graceful: 'Apps were asked to save their work before the computer restarted.',
		forced: 'Some apps didn’t close in time and were stopped before the computer restarted.',
		emergency: 'The computer had to restart without waiting for apps.'
	};

	const when = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });

	let list = $state<Problem[]>([]);
	let open = $state<Problem | null>(null);
	let expanded = $state(false);
	let error = $state('');

	async function restart() {
		try {
			await restartToFirmware();
		} catch (reason) {
			error = String(reason);
		}
	}

	problems().then((loaded) => (list = loaded));
</script>

{#if list.length}
	<Section title="Recent problems">
		{#each expanded ? list : list.slice(0, COLLAPSED) as problem (problem.id)}
			<ActionRow
				icon={MonitorX}
				title="The graphics driver stopped responding"
				description="{when.format(problem.time * 1000)} · The computer restarted itself"
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
		title="The graphics driver stopped responding"
		description="{when.format(problem.time * 1000)}. {AFTERMATH[problem.restart]}"
		wide
		onclose={() => (open = null)}
	>
		<div class="flex flex-col gap-5">
			{#if problem.suggestions.length}
				<div class="flex flex-col gap-3">
					<h3 class="text-[14px] font-semibold">What can help</h3>
					{#each problem.suggestions as suggestion (suggestion.step)}
						<div class="flex flex-col gap-1">
							<span class="text-[13.5px] font-medium">{suggestion.step}</span>
							<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{suggestion.detail}</p>
						</div>
					{/each}
				</div>
			{/if}
			<div class="flex flex-col gap-2">
				<h3 class="text-[14px] font-semibold">What happened</h3>
				{#if problem.graphics.length}
					<p class="text-[13px] text-[var(--text-muted)]">{problem.graphics.join(', ')}</p>
				{/if}
				<ul class="flex flex-col gap-1 font-mono text-[12px] leading-relaxed text-[var(--text-muted)]">
					{#each problem.evidence as line, index (index)}
						<li class="break-words">{line}</li>
					{/each}
				</ul>
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">
					The full kernel log of that session stays in the system journal. Running nvidia-bug-report.sh as an administrator collects it for a driver bug report.
				</p>
			</div>
			{#if error}
				<p class="text-[13px] text-[var(--danger)]">{error}</p>
			{/if}
		</div>
		{#snippet actions()}
			{#if problem.suggestions.some((suggestion) => suggestion.action === 'firmware-settings')}
				<button type="button" class="button" onclick={restart}>Restart into firmware settings</button>
			{/if}
			<button type="button" class="button primary" onclick={() => (open = null)}>Done</button>
		{/snippet}
	</Dialog>
{/if}
