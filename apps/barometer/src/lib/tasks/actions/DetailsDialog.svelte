<script lang="ts">
	import { AppIcon, Dialog } from '@luft/ui';
	import type { Details } from '$lib/backend/types';
	import { bytes, count, cpuTime, date, duration, percent, rate } from '$lib/format';
	import { app } from '$lib/state/app.svelte';
	import { processes } from '$lib/state/processes.svelte';
	import { desktopId } from '../icons';
	import { tasks } from './actions.svelte';

	interface Props {
		pid: number;
	}

	const STATES: Record<string, string> = { R: 'Running', S: 'Sleeping', D: 'Waiting for a device', T: 'Paused', t: 'Traced', Z: 'Finished, waiting for its parent', I: 'Idle' };

	let { pid }: Props = $props();

	let details = $state<Details | null>(null);
	let failure = $state<string | null>(null);
	let live = $derived(processes.list.find((process) => process.pid === pid));
	let owner = $derived(live?.app ? processes.apps.get(live.app) : undefined);
	let name = $derived(live?.name ?? details?.arguments[0]?.split('/').at(-1) ?? `Process ${pid}`);

	$effect(() => {
		details = null;
		failure = null;
		app.backend
			?.details(pid)
			.then((loaded) => (details = loaded))
			.catch((error) => (failure = error instanceof Error ? error.message : String(error)));
	});

	function rows(details: Details) {
		return [
			{ label: 'Command line', value: details.arguments.join(' '), mono: true, wrap: true },
			{ label: 'Program', value: details.executable, mono: true },
			{ label: 'Working folder', value: details.directory, mono: true },
			{ label: 'User', value: details.user },
			{ label: 'Started', value: `${date(details.started)}, ${duration(Date.now() / 1000 - details.started)} ago` },
			{ label: 'Parent', value: details.parent ? `${details.parent} (${details.ppid})` : String(details.ppid) },
			{ label: 'State', value: STATES[details.state] ?? details.state },
			{ label: 'Threads', value: count(details.threads) },
			{ label: 'Niceness', value: String(details.nice) },
			{ label: 'Open files', value: details.openFiles === null ? null : count(details.openFiles) },
			{ label: 'Runs in', value: details.container },
			{ label: 'Control group', value: details.cgroup, mono: true, wrap: true },
			{ label: 'Resident memory', value: details.resident === null ? null : bytes(details.resident) },
			{ label: 'Private', value: details.anonymous === null ? null : bytes(details.anonymous) },
			{ label: 'Mapped files', value: details.fileBacked === null ? null : bytes(details.fileBacked) },
			{ label: 'Shared', value: details.shared === null ? null : bytes(details.shared) },
			{ label: 'Swapped out', value: details.swap ? bytes(details.swap) : null },
			{ label: 'Address space', value: details.virtualSize === null ? null : bytes(details.virtualSize) },
			{ label: 'Context switches', value: details.switches === null ? null : count(details.switches) },
			{ label: 'Out of memory score', value: details.oomScore === null ? null : String(details.oomScore) }
		].filter((row) => row.value);
	}
</script>

<Dialog title={name} wide onclose={() => (tasks.details = null)}>
	<div class="flex items-center gap-4">
		<AppIcon icon={owner?.icon ?? null} id={desktopId(owner?.key)} size={40} />
		<div class="flex min-w-0 flex-col">
			<span class="truncate text-[14px] font-medium">{owner?.name ?? name}</span>
			<span class="text-[12.5px] text-[var(--text-muted)] tabular-nums">Process {pid}</span>
		</div>
	</div>

	{#if live}
		<div class="usage">
			{#each [['Processor', percent(live.cpu, 1)], ['Memory', bytes(live.memory)], ['Disk', rate(live.read + live.write)], ['Processor time', cpuTime(live.userTime + live.systemTime)]] as [label, value] (label)}
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
		<button type="button" class="button" onclick={() => (tasks.details = null)}>Close</button>
		<button type="button" class="button danger" onclick={() => tasks.end({ title: name, pids: [pid] })}>End process</button>
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
