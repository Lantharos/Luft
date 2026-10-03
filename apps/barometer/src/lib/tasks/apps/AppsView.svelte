<script lang="ts">
	import { SearchField } from '@luft/ui';
	import type { Process } from '#lib/backend/rows.js';
	import type { AppUsage } from '#lib/backend/types.js';
	import { plural } from '#lib/format.js';
	import Header from '#lib/shell/Header.svelte';
	import { processes } from '#lib/state/processes.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import { usage } from '#lib/state/usage.svelte.js';
	import ColumnsMenu from '#lib/tasks/ColumnsMenu.svelte';
	import { APP_COLUMN_IDS, columnsFor, compare, toggleSort, type Row } from '#lib/tasks/columns.js';
	import TaskMenu from '#lib/tasks/actions/TaskMenu.svelte';
	import { tasks, type Target } from '#lib/tasks/actions/actions.svelte.js';
	import TaskTable, { type Item } from '#lib/tasks/TaskTable.svelte';
	import { matches } from '#lib/tasks/search.js';

	let query = $state('');
	let selected = $state<string | null>(null);
	let menu = $state<{ at: { x: number; y: number }; target: Target; process?: Process; stopped: boolean } | null>(null);
	let columnsMenu = $state<{ x: number; y: number } | null>(null);
	let search = $state<SearchField>();

	let columns = $derived(columnsFor(settings.value.appColumns));
	let order = $derived(compare(settings.value.appSort));
	let children = $derived(Map.groupBy(processes.list, (process) => process.app ?? ''));
	let shown = $derived(
		usage.apps.filter((app) => {
			const needle = query.trim().toLowerCase();
			return !needle || app.name.toLowerCase().includes(needle) || (children.get(app.key) ?? []).some((process) => matches(process, query));
		})
	);
	let items = $derived(
		shown
			.map((app) => ({ app, row: rowOf(app) }))
			.sort((a, b) => order(a.row, b.row))
			.flatMap(({ app, row }) => {
				const open = usage.expanded.includes(app.key);
				const head: Item = {
					key: `app:${app.key}`,
					row,
					title: app.name,
					icon: app.icon,
					app: app.key,
					note: app.paused ? 'Paused' : undefined,
					expanded: open
				};
				if (!open) return [head];
				const members = [...(children.get(app.key) ?? [])].sort(order);
				return [head, ...members.map((process): Item => ({ key: `pid:${process.pid}`, row: process, title: process.name, icon: app.icon, app: app.key, child: true, note: process.state === 'T' ? 'Paused' : undefined }))];
			})
	);
	let current = $derived(selected ? targetOf(selected) : null);

	function rowOf(app: AppUsage): Row {
		return { ...app, nice: 0, state: app.paused ? 'T' : 'S', userTime: 0, systemTime: 0 };
	}

	function targetOf(key: string): { target: Target; process?: Process; stopped: boolean } | null {
		if (key.startsWith('pid:')) {
			const process = processes.list.find((candidate) => candidate.pid === Number(key.slice(4)));
			return process ? { target: { title: process.name, pids: [process.pid] }, process, stopped: process.state === 'T' } : null;
		}
		const found = usage.apps.find((candidate) => `app:${candidate.key}` === key);
		return found ? { target: { title: found.name, app: found.key }, stopped: found.paused } : null;
	}

	function open(item: Item) {
		if (item.child) tasks.details = (item.row as Process).pid;
		else usage.toggle(item.key.slice(4));
	}

	function end(key: string, force: boolean) {
		const found = targetOf(key);
		if (found) void (force ? tasks.kill(found.target) : tasks.end(found.target));
	}

	function shortcuts(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
			event.preventDefault();
			search?.focus();
		}
	}
</script>

<svelte:window onkeydown={shortcuts} />

<Header title="Apps" detail={usage.ready ? `${plural(usage.apps.length, 'app')} running` : null}>
	<div class="w-[240px]" data-no-drag>
		<SearchField bind:this={search} bind:value={query} label="Search apps" />
	</div>
	<button type="button" class="button" disabled={!current} data-no-drag onclick={() => selected && end(selected, false)}>
		{current?.process ? 'End process' : 'End app'}
	</button>
</Header>

{#if usage.ready && !items.length}
	<p class="px-8 pt-6 text-[13px] text-[var(--text-muted)]">{query ? `Nothing matches “${query}”.` : 'No apps are running.'}</p>
{:else}
	<TaskTable
		{items}
		{columns}
		label="Apps"
		sort={settings.value.appSort}
		{selected}
		onsort={(column) => settings.update({ appSort: toggleSort(settings.value.appSort, column) })}
		oncolumns={(event) => {
			event.preventDefault();
			columnsMenu = { x: event.clientX, y: event.clientY };
		}}
		onselect={(item) => (selected = item.key)}
		onopen={open}
		ontoggle={(item) => usage.toggle(item.key.slice(4))}
		onmenu={(event, item) => {
			const found = targetOf(item.key);
			if (found) menu = { at: { x: event.clientX, y: event.clientY }, ...found };
		}}
		onend={(item, force) => end(item.key, force)}
	/>
{/if}

{#if menu}
	<TaskMenu at={menu.at} target={menu.target} process={menu.process} stopped={menu.stopped} onclose={() => (menu = null)} />
{/if}

{#if columnsMenu}
	<ColumnsMenu
		at={columnsMenu}
		available={APP_COLUMN_IDS}
		shown={settings.value.appColumns}
		onchange={(appColumns) => settings.update({ appColumns })}
		onclose={() => (columnsMenu = null)}
	/>
{/if}
