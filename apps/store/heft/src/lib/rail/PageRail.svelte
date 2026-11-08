<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { t } from '@luft/i18n';
	import { ContextMenu, date, MenuItem, MenuSeparator, Segmented } from '@luft/ui';
	import { draggable, dropTarget } from '#lib/drag/drag.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import type { PageEntry, Section } from '#lib/library/model.js';
	import NameDialog from '#lib/shell/NameDialog.svelte';
	import { notebookOutline, type Heading } from '#lib/pdf/outline.js';
	import Contents from './Contents.svelte';
	import Thumbnail from './Thumbnail.svelte';

	let { notebook, current, onjump }: { notebook: OpenNotebook; current: number; onjump: (index: number) => void } = $props();

	const WIDTH = 168;

	let menu: { x: number; y: number; index: number } | null = $state(null);
	let naming: { page: string; section?: Section } | null = $state(null);
	let headings: Heading[] = $state([]);
	let view: 'pages' | 'contents' = $state('pages');

	$effect(() => {
		if (!notebook.meta.pages.some((page) => page.pdf)) return;
		void notebookOutline(notebook).then((found) => (headings = found));
	});

	let sectionAt = $derived(new Map(notebook.meta.sections.map((section) => [section.page, section])));

	$effect(() => {
		document.querySelector(`[data-rail-page="${notebook.meta.pages[current]?.id}"]`)?.scrollIntoView({ block: 'nearest' });
	});

	function open(event: MouseEvent, index: number) {
		event.preventDefault();
		menu = { x: event.clientX, y: event.clientY, index };
	}

	function run(action: (index: number) => void) {
		if (menu) action(menu.index);
		menu = null;
	}

	const lessonDate = (page: PageEntry) => date(Math.floor(page.created / 1000));
</script>

<aside class="glass-sidebar rail soft-scroll" aria-label={t('rail-label')}>
	{#if headings.length}
		<div class="px-3 pt-3">
			<Segmented
				label={t('rail-view')}
				value={view}
				options={[
					{ value: 'pages', label: t('rail-pages') },
					{ value: 'contents', label: t('rail-contents') }
				]}
				onchange={(next) => (view = next)}
			/>
		</div>
	{/if}
	{#if view === 'contents' && headings.length}
		<Contents {headings} {current} {onjump} />
	{:else}
	<ol class="flex flex-col gap-1 px-3 pt-2 pb-6">
		{#each notebook.meta.pages as page, index (page.id)}
			{@const section = sectionAt.get(page.id)}
			{#if section}
				<li class="section">
					<button type="button" class="truncate" onclick={() => (naming = { page: page.id, section })}>{section.title}</button>
				</li>
			{/if}
			<li
				class="page"
				data-rail-page={page.id}
				{@attach dropTarget({ kind: 'page', notebook: notebook.meta.id, page: page.id })}
				{@attach draggable(
					() => ({ kind: 'page', notebook: notebook.meta.id, page: page.id }),
					() => t('rail-page', { number: index + 1 })
				)}
			>
				<button type="button" class="jump" aria-current={index === current ? 'page' : undefined} onclick={() => onjump(index)} oncontextmenu={(event) => open(event, index)}>
					<Thumbnail {notebook} entry={page} width={WIDTH} />
					<span class="meta">
						<span class="tabular-nums">{index + 1}</span>
						<span class="truncate">{lessonDate(page)}</span>
					</span>
				</button>
				<button type="button" class="more" aria-label={t('rail-page-options', { number: index + 1 })} onclick={(event) => open(event, index)}>
					<Ellipsis size={15} />
				</button>
			</li>
		{/each}
	</ol>
	{/if}
</aside>

{#if menu}
	<ContextMenu at={menu} onclose={() => (menu = null)}>
		<MenuItem onclick={() => run((index) => notebook.addPage(index))}>{t('rail-add-before')}</MenuItem>
		<MenuItem onclick={() => run((index) => notebook.addPage(index + 1))}>{t('rail-add-after')}</MenuItem>
		<MenuItem onclick={() => run((index) => void notebook.duplicatePage(index))}>{t('rail-duplicate')}</MenuItem>
		<MenuItem onclick={() => run((index) => (naming = { page: notebook.meta.pages[index].id }))}>{t('rail-section')}</MenuItem>
		<MenuSeparator />
		<MenuItem danger onclick={() => run((index) => notebook.trashPage(index))}>{t('rail-delete')}</MenuItem>
	</ContextMenu>
{/if}

{#if naming}
	{@const section = naming.section}
	<NameDialog
		title={section ? t('section-rename-title') : t('section-new-title')}
		label={t('section-name')}
		action={section ? t('dialog-save') : t('section-create')}
		value={section?.title ?? ''}
		onsave={(title) => (section ? notebook.renameSection(section.id, title) : notebook.addSection(naming!.page, title))}
		onclose={() => (naming = null)}
	/>
{/if}

<style>
	.rail {
		overflow-y: auto;
	}

	.section {
		padding: 14px 6px 4px;
		font-size: 12px;
		font-weight: 600;
		color: var(--sidebar-text);
	}

	.section button {
		max-width: 100%;
		text-align: left;
	}

	.page {
		position: relative;
		border-radius: 12px;
	}

	.jump {
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		border-radius: 12px;
		padding: 10px 10px 6px;
		transition: background-color var(--motion-tap);
	}

	.jump:hover {
		background: var(--sidebar-control);
	}

	.jump[aria-current='page'] {
		background: var(--sidebar-active);
	}

	.meta {
		display: flex;
		width: 100%;
		justify-content: space-between;
		gap: 8px;
		padding-inline: 2px;
		font-size: 11.5px;
		color: var(--sidebar-text-muted);
	}

	.more {
		position: absolute;
		top: 14px;
		right: 14px;
		display: grid;
		height: 26px;
		width: 26px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--popover);
		color: var(--text-soft);
		opacity: 0;
		box-shadow: 0 2px 8px var(--shadow-faint);
		transition: opacity var(--motion-tap);
	}

	.page:hover .more,
	.more:focus-visible {
		opacity: 1;
	}

	.page:global([data-drop-over]) {
		box-shadow: inset 0 -3px 0 var(--accent-line);
	}
</style>
