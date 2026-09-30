<script lang="ts">
	import { SearchField } from '@luft/ui';
	import type { Process } from '$lib/backend/rows';
	import { plural } from '$lib/format';
	import Header from '$lib/shell/Header.svelte';
	import { processes } from '$lib/state/processes.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import ColumnsMenu from '$lib/tasks/ColumnsMenu.svelte';
	import { COLUMNS, columnsFor, compare, toggleSort } from '$lib/tasks/columns';
	import TaskMenu from '$lib/tasks/actions/TaskMenu.svelte';
	import { tasks } from '$lib/tasks/actions/actions.svelte';
	import TaskTable, { type Item } from '$lib/tasks/TaskTable.svelte';
	import { matches } from '$lib/tasks/search';

	let query = $state('');
	let selected = $state<number | null>(null);
	let menu = $state<{ at: { x: number; y: number }; process: Process } | null>(null);
	let columnsMenu = $state<{ x: number; y: number } | null>(null);
	let search = $state<SearchField>();

	let columns = $derived(columnsFor(settings.value.processColumns));
	let visible = $derived(processes.list.filter((process) => matches(process, query, processes.apps.get(process.app ?? '')?.name)));
	let sorted = $derived(visible.sort(compare(settings.value.processSort)));
	let items = $derived(
		sorted.map(
			(process): Item => ({
				key: String(process.pid),
				row: process,
				title: process.name,
				icon: processes.apps.get(process.app ?? '')?.icon ?? null,
				app: process.app,
				note: process.state === 'T' ? 'Paused' : undefined
			})
		)
	);
	let current = $derived(processes.list.find((process) => process.pid === selected));

	function processOf(item: Item) {
		return item.row as Process;
	}

	function end(process: Process, force: boolean) {
		const target = { title: process.name, pids: [process.pid] };
		void (force ? tasks.kill(target) : tasks.end(target));
	}

	function shortcuts(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
			event.preventDefault();
			search?.focus();
		}
	}
</script>

<svelte:window onkeydown={shortcuts} />

<Header title="Processes" detail={processes.ready ? plural(processes.list.length, 'process', 'processes') : null}>
	<div class="w-[240px]" data-no-drag>
		<SearchField bind:this={search} bind:value={query} label="Search processes" />
	</div>
	<button type="button" class="button" disabled={!current} data-no-drag onclick={() => current && end(current, false)}>End process</button>
</Header>

{#if processes.ready && !items.length && query}
	<p class="px-8 pt-6 text-[13px] text-[var(--text-muted)]">Nothing matches “{query}”.</p>
{:else}
	<TaskTable
		{items}
		{columns}
		label="Processes"
		sort={settings.value.processSort}
		selected={selected === null ? null : String(selected)}
		onsort={(column) => settings.update({ processSort: toggleSort(settings.value.processSort, column) })}
		oncolumns={(event) => {
			event.preventDefault();
			columnsMenu = { x: event.clientX, y: event.clientY };
		}}
		onselect={(item) => (selected = processOf(item).pid)}
		onopen={(item) => (tasks.details = processOf(item).pid)}
		onmenu={(event, item) => (menu = { at: { x: event.clientX, y: event.clientY }, process: processOf(item) })}
		onend={(item, force) => end(processOf(item), force)}
	/>
{/if}

{#if menu}
	<TaskMenu
		at={menu.at}
		process={menu.process}
		target={{ title: menu.process.name, pids: [menu.process.pid] }}
		stopped={menu.process.state === 'T'}
		onclose={() => (menu = null)}
	/>
{/if}

{#if columnsMenu}
	<ColumnsMenu
		at={columnsMenu}
		available={COLUMNS.map((column) => column.id)}
		shown={settings.value.processColumns}
		onchange={(processColumns) => settings.update({ processColumns })}
		onclose={() => (columnsMenu = null)}
	/>
{/if}
