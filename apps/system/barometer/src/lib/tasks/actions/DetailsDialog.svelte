<script lang="ts">
	import { t } from '@luft/i18n';
	import { AppIcon, dateTime, Dialog, duration, errorText, memoryBytes } from '@luft/ui';
	import type { Details } from '#lib/bindings.js';
	import { count, cpuTime, percent, rate } from '#lib/format.js';
	import { app } from '#lib/state/app.svelte.js';
	import { processes } from '#lib/state/processes.svelte.js';
	import { desktopId } from '../icons';
	import { tasks } from './actions.svelte';

	interface Props {
		pid: number;
	}

	let { pid }: Props = $props();

	let details = $state<Details | null>(null);
	let failure = $state<string | null>(null);
	let live = $derived(processes.list.find((process) => process.pid === pid));
	let owner = $derived(live?.app ? processes.apps.get(live.app) : undefined);
	let name = $derived(live?.name ?? details?.arguments[0]?.split('/').at(-1) ?? t('barometer-details-process', { pid: String(pid) }));
	let usageLabels = $derived({
		cpu: t('barometer-details-cpu'),
		memory: t('barometer-details-memory'),
		disk: t('barometer-details-disk'),
		time: t('barometer-column-time')
	});

	$effect(() => {
		details = null;
		failure = null;
		app.backend
			?.details(pid)
			.then((loaded) => (details = loaded))
			.catch((error) => (failure = errorText(error)));
	});

	function rows(details: Details) {
		const states: Record<string, string> = {
			R: t('barometer-details-state-running'),
			S: t('barometer-details-state-sleeping'),
			D: t('barometer-details-state-waiting'),
			T: t('barometer-details-state-paused'),
			t: t('barometer-details-state-traced'),
			Z: t('barometer-details-state-zombie'),
			I: t('barometer-details-state-idle')
		};
		return [
			{ label: t('barometer-details-command-line'), value: details.arguments.join(' '), mono: true, wrap: true },
			{ label: t('barometer-details-program'), value: details.executable, mono: true },
			{ label: t('barometer-details-folder'), value: details.directory, mono: true },
			{ label: t('barometer-column-user'), value: details.user },
			{ label: t('barometer-column-started'), value: t('barometer-details-started', { date: dateTime(details.started), duration: duration(Date.now() / 1000 - details.started) }) },
			{ label: t('barometer-details-parent'), value: details.parent ? t('barometer-details-parent-named', { name: details.parent, pid: String(details.ppid) }) : String(details.ppid) },
			{ label: t('barometer-column-state'), value: states[details.state] ?? details.state },
			{ label: t('barometer-column-threads'), value: count(details.threads) },
			{ label: t('barometer-priority-niceness'), value: String(details.nice) },
			{ label: t('barometer-details-open-files'), value: details.openFiles === null ? null : count(details.openFiles) },
			{ label: t('barometer-details-runs-in'), value: details.container },
			{ label: t('barometer-details-cgroup'), value: details.cgroup, mono: true, wrap: true },
			{ label: t('barometer-details-resident'), value: details.resident === null ? null : memoryBytes(details.resident) },
			{ label: t('barometer-details-private'), value: details.anonymous === null ? null : memoryBytes(details.anonymous) },
			{ label: t('barometer-details-mapped'), value: details.fileBacked === null ? null : memoryBytes(details.fileBacked) },
			{ label: t('barometer-details-shared'), value: details.shared === null ? null : memoryBytes(details.shared) },
			{ label: t('barometer-details-swapped'), value: details.swap ? memoryBytes(details.swap) : null },
			{ label: t('barometer-details-address-space'), value: details.virtualSize === null ? null : memoryBytes(details.virtualSize) },
			{ label: t('barometer-details-switches'), value: details.switches === null ? null : count(details.switches) },
			{ label: t('barometer-details-oom'), value: details.oomScore === null ? null : String(details.oomScore) }
		].filter((row) => row.value);
	}
</script>

<Dialog title={name} wide onclose={() => (tasks.details = null)}>
	<div class="flex items-center gap-4">
		<AppIcon icon={owner?.icon ?? null} id={desktopId(owner?.key)} size={40} />
		<div class="flex min-w-0 flex-col">
			<span class="truncate text-[14px] font-medium">{owner?.name ?? name}</span>
			<span class="text-[12.5px] text-[var(--text-muted)] tabular-nums select-text">{t('barometer-details-process', { pid: String(pid) })}</span>
		</div>
	</div>

	{#if live}
		<div class="usage">
			{#each [[usageLabels.cpu, percent(live.cpu, 1)], [usageLabels.memory, memoryBytes(live.memory)], [usageLabels.disk, rate(live.read + live.write)], [usageLabels.time, cpuTime(live.userTime + live.systemTime)]] as [label, value] (label)}
				<div class="flex flex-col gap-0.5">
					<span class="text-[12px] text-[var(--text-muted)]">{label}</span>
					<span>{value}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if failure}
		<p class="text-[13px] text-[var(--text-muted)]">{failure}</p>
	{:else if details}
		<dl class="flex flex-col">
			{#each rows(details) as row (row.label)}
				<div class="row" class:wrap={row.wrap}>
					<dt>{row.label}</dt>
					<dd class:font-mono={row.mono} class:mono={row.mono}>{row.value}</dd>
				</div>
			{/each}
		</dl>
	{/if}

	{#snippet actions()}
		<button type="button" class="button" onclick={() => (tasks.details = null)}>{t('barometer-close')}</button>
		<button type="button" class="button danger" onclick={() => tasks.end({ title: name, pids: [pid] })}>{t('barometer-end-process')}</button>
	{/snippet}
</Dialog>

<style>
	.usage {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		font-size: 15px;
		font-variant-numeric: tabular-nums;
	}

	.row {
		display: grid;
		grid-template-columns: 150px minmax(0, 1fr);
		gap: 16px;
		padding-block: 8px;
		border-bottom: 1px solid var(--hairline);
		font-size: 13px;
	}

	dt {
		color: var(--text-muted);
	}

	dd {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		user-select: text;
	}

	.wrap dd {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.mono {
		font-size: 12px;
		font-variant-ligatures: none;
	}
</style>
