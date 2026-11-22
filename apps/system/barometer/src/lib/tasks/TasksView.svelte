<script lang="ts">
	import { t } from '@luft/i18n';
	import { SearchField, Segmented } from '@luft/ui';
	import List from '@luft/symbols/icons/list';
	import ListTree from '@luft/symbols/icons/list-tree';
	import { tick, untrack } from 'svelte';
	import Header from '#lib/shell/Header.svelte';
	import { entries } from '#lib/state/entries.svelte.js';
	import { processes } from '#lib/state/processes.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import ColumnsMenu from './ColumnsMenu.svelte';
	import { columnsFor, toggleSort } from './columns';
	import { tasks } from './actions/actions.svelte';
	import TaskMenu from './actions/TaskMenu.svelte';
	import { isDesktopApp } from './icons';
	import TaskTable from './TaskTable.svelte';
	import { targetOf, type Found } from './targets';
	import type { Node } from './tree/node.svelte';
	import { TaskTree } from './tree/tree.svelte';

	const views: { value: View; label: string }[] = $derived([
		{ value: 'grouped', label: t('barometer-view-grouped') },
		{ value: 'flat', label: t('barometer-view-flat') }
	]);

	type View = 'grouped' | 'flat';

	const tree = new TaskTree();

	let selected = $state<string | null>(null);
	let menu = $state<({ at: { x: number; y: number } } & Found) | null>(null);
	let columnsMenu = $state<{ x: number; y: number } | null>(null);
	let search = $state<SearchField>();
	let table = $state<TaskTable>();

	let flat = $derived(settings.value.flat);
	let columns = $derived(columnsFor(settings.value.columns));
	let current = $derived(selected ? tree.find(selected) : undefined);
	let found = $derived(current ? targetOf(current) : null);
	let ready = $derived(flat ? processes.ready : entries.ready);
	let shownCount = $derived(flat ? processes.list.length : entries.list.filter((entry) => entry.group === 'apps').length);
	let detail = $derived(flat ? t('barometer-processes-count', { count: shownCount }) : t('barometer-apps-count', { count: shownCount }));

	$effect(() => {
		const input = {
			entries: entries.list,
			processes: processes.list,
			owners: processes.apps,
			sort: settings.value.sort,
			query: entries.query,
			expanded: entries.expanded,
			collapsed: entries.collapsed,
			flat,
			stopping: tasks.stopping
		};
		untrack(() => tree.update(input));
	});

	$effect(() => {
		const key = entries.focusing;
		const items = tree.items;
		if (!key || !ready) return;
		untrack(() => focus(key, items));
	});

	function focus(key: string, items: Node[]) {
		const node = flat ? items.find((candidate) => candidate.kind === 'process' && candidate.app === key) : tree.find(`entry:${key}`);
		const entry = entries.find(key);
		if (!node && entry && !flat && entries.collapsed.has(entry.group)) {
			entries.reveal(entry.group);
			return;
		}
		entries.focusing = null;
		if (!node) return;
		selected = node.key;
		void tick().then(() => table?.reveal(node.key));
	}

	function toggle(node: Node) {
		if (node.kind === 'group' && node.group) entries.toggleGroup(node.group);
		else if (node.kind === 'entry' && node.entry) entries.toggle(node.entry.key);
	}

	function open(node: Node) {
		if (node.kind === 'process' && node.process) tasks.details = node.process.pid;
		else toggle(node);
	}

	function end(node: Node, force: boolean) {
		const target = targetOf(node)?.target;
		if (target) void (force ? tasks.kill(target) : tasks.end(target));
	}

	function type(text: string) {
		entries.query += text;
		search?.focus();
	}

	function shortcuts(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
			event.preventDefault();
			search?.focus();
		}
	}
</script>

<svelte:window onkeydown={shortcuts} />

{#snippet actions(node: Node)}
	{@const entry = node.kind === 'entry' && node.entry?.group === 'background' && isDesktopApp(node.entry.key) ? node.entry : null}
	{#if entry}
		<span class="ml-auto flex flex-none gap-1.5" role="presentation" onpointerdown={(event) => event.stopPropagation()} ondblclick={(event) => event.stopPropagation()}>
			<button type="button" class="button row-action" onclick={() => tasks.open(entry.key)}>{t('barometer-open')}</button>
			<button type="button" class="button row-action" disabled={tasks.stopping.has(entry.key)} onclick={() => tasks.stop(entry.key)}>{t('barometer-stop')}</button>
		</span>
	{/if}
{/snippet}

{#snippet view(option: { value: View; label: string })}
	{#if option.value === 'flat'}
		<List size={16} />
	{:else}
		<ListTree size={16} />
	{/if}
{/snippet}

<Header title={t('barometer-processes-title')} detail={ready ? detail : null}>
	<div class="w-[84px]" data-no-drag>
		<Segmented label={t('barometer-view')} options={views} value={flat ? 'flat' : 'grouped'} item={view} onchange={(next) => settings.update({ flat: next === 'flat' })} />
	</div>
	<div class="w-[200px]" data-no-drag>
		<SearchField bind:this={search} bind:value={entries.query} label={t('barometer-search')} />
	</div>
	<button type="button" class="button" disabled={!found} data-no-drag onclick={() => current && end(current, false)}>
		{found && 'app' in found.target ? t('barometer-end-app') : t('barometer-end-process')}
	</button>
</Header>

{#if ready && !tree.items.length && entries.searching}
	<p class="px-8 pt-6 text-[13px] text-[var(--text-muted)]">{t('barometer-search-empty', { query: entries.query })}</p>
{:else}
	<TaskTable
		bind:this={table}
		items={tree.items}
		{columns}
		label={t('barometer-processes-title')}
		sort={settings.value.sort}
		{selected}
		onsort={(column) => settings.update({ sort: toggleSort(settings.value.sort, column) })}
		oncolumns={(event) => {
			event.preventDefault();
			columnsMenu = { x: event.clientX, y: event.clientY };
		}}
		onselect={(node) => (selected = node.key)}
		onopen={open}
		ontoggle={toggle}
		onmenu={(event, node) => {
			const target = targetOf(node);
			if (target) menu = { at: { x: event.clientX, y: event.clientY }, ...target };
		}}
		onend={end}
		ontype={type}
		{actions}
	/>
{/if}

{#if menu}
	<TaskMenu at={menu.at} target={menu.target} process={menu.process} entry={menu.entry} stopped={menu.stopped} onclose={() => (menu = null)} />
{/if}

{#if columnsMenu}
	<ColumnsMenu at={columnsMenu} shown={settings.value.columns} onchange={(next) => settings.update({ columns: next })} onclose={() => (columnsMenu = null)} />
{/if}

<style>
	.row-action {
		min-height: 26px;
		padding-inline: 12px;
		font-size: 12px;
	}
</style>
