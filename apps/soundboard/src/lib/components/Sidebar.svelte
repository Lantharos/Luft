<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { ConfirmDialog, ContextMenu, Dialog, MenuItem, MenuSeparator, selectionPill, TextField, tooltip } from '@luft/ui';
	import { t } from '@luft/i18n';
	import type { Board } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import MixPanel from './MixPanel.svelte';

	let menu = $state<{ board: Board; at: { x: number; y: number } } | null>(null);
	let renaming = $state<{ board: Board; name: string } | null>(null);
	let removing = $state<Board | null>(null);

	function open(event: MouseEvent, board: Board) {
		event.preventDefault();
		menu = { board, at: { x: event.clientX, y: event.clientY } };
	}

	async function exportBoard(board: Board) {
		await app.exportBoard(board).then(() => toast.show(t('board-exported')), app.failed);
	}

	async function importBoard() {
		const before = app.library.boards.length;
		await app.importBoard().catch(app.failed);
		if (app.library.boards.length > before) toast.show(t('board-imported'));
	}

	function rename() {
		if (renaming?.name.trim()) void app.renameBoard(renaming.board.id, renaming.name.trim());
		renaming = null;
	}
</script>

<aside class="glass-sidebar drag-region gap-3 px-3 py-4">
	<div class="flex h-8 items-center justify-between pr-1 pl-3">
		<h2 class="text-[13px] font-medium text-[var(--sidebar-text-muted)]">{t('boards-title')}</h2>
		<button type="button" class="add" aria-label={t('board-new')} {@attach tooltip(t('board-new'))} onclick={() => void app.addBoard()}>
			<Plus size={16} />
		</button>
	</div>
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto" {@attach selectionPill()}>
		{#each app.library.boards as board (board.id)}
			{@const active = app.board?.id === board.id && !app.search}
			<button
				type="button"
				class="nav-item"
				class:active
				aria-current={active ? 'page' : undefined}
				onclick={() => {
					app.boardId = board.id;
					app.search = '';
				}}
				oncontextmenu={(event) => open(event, board)}
			>
				<span class="truncate">{board.name}</span>
				<span class="count">{board.sounds.length}</span>
			</button>
		{/each}
	</nav>
	<MixPanel />
</aside>

{#if menu}
	{@const { board, at } = menu}
	<ContextMenu {at} onclose={() => (menu = null)}>
		<MenuItem onclick={() => (renaming = { board, name: board.name })}>{t('board-rename')}</MenuItem>
		<MenuItem onclick={() => void exportBoard(board)}>{t('board-export')}</MenuItem>
		<MenuItem onclick={() => void importBoard()}>{t('board-import')}</MenuItem>
		<MenuSeparator />
		<MenuItem danger onclick={() => (removing = board)}>{t('board-remove')}</MenuItem>
	</ContextMenu>
{/if}

{#if renaming}
	<Dialog title={t('board-rename')} onclose={() => (renaming = null)}>
		<TextField bind:value={renaming.name} label={t('board-name')} onkeydown={(event) => event.key === 'Enter' && rename()} />
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (renaming = null)}>{t('editor-cancel')}</button>
			<button type="button" class="button primary" onclick={rename}>{t('editor-save')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if removing}
	{@const board = removing}
	<ConfirmDialog
		title={t('board-remove-title', { name: board.name })}
		description={t('board-remove-detail', { count: board.sounds.length })}
		action={t('board-remove')}
		danger
		run={() => app.removeBoard(board.id)}
		onclose={() => (removing = null)}
	/>
{/if}

<style>
	.add {
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--sidebar-text-muted);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.add:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item {
		display: flex;
		height: 38px;
		width: 100%;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.nav-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item.active {
		background: transparent;
		color: var(--text);
	}

	.nav-item:active {
		transform: scale(0.97);
	}

	.count {
		font-size: 12.5px;
		color: var(--sidebar-text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
