<script lang="ts">
	import { ConfirmDialog, ContextMenu, Dialog, MenuItem, MenuSeparator, TextField } from '@luft/ui';
	import { t } from '@luft/i18n';
	import type { Board } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';

	let name = $state('');

	const close = () => (app.menu = null);

	function dismiss(event: Event) {
		if (event.target instanceof Element && event.target.closest('[role="menu"]')) return;
		close();
	}

	function run(action: () => unknown) {
		void action();
		close();
	}

	async function exportBoard(board: Board) {
		await app.exportBoard(board).then(() => toast.show(t('board-exported')), app.failed);
	}

	async function importBoard() {
		const before = app.library.boards.length;
		await app.importBoard().catch(app.failed);
		if (app.library.boards.length > before) toast.show(t('board-imported'));
	}

	function startRenaming(board: Board) {
		name = board.name;
		app.renaming = board;
	}

	function rename() {
		if (app.renaming && name.trim()) void app.renameBoard(app.renaming.id, name.trim());
		app.renaming = null;
	}
</script>

<svelte:window onpointerdown={dismiss} onblur={close} onkeydown={(event) => event.key === 'Escape' && close()} />

{#if app.menu}
	{#key app.menu}
		<ContextMenu at={app.menu.at} onclose={close}>
			{#if app.menu.kind === 'board'}
				{@const { board } = app.menu}
				<MenuItem onclick={() => run(() => startRenaming(board))}>{t('board-rename')}</MenuItem>
				<MenuItem onclick={() => run(() => exportBoard(board))}>{t('board-export')}</MenuItem>
				<MenuItem onclick={() => run(importBoard)}>{t('board-import')}</MenuItem>
				<MenuSeparator />
				<MenuItem danger onclick={() => run(() => (app.removing = board))}>{t('board-remove')}</MenuItem>
			{:else}
				{@const { sound } = app.menu}
				<MenuItem onclick={() => run(() => (app.editing = sound))}>{t('tile-edit')}</MenuItem>
				<MenuItem danger onclick={() => run(() => app.removeSound(sound))}>{t('tile-remove')}</MenuItem>
			{/if}
		</ContextMenu>
	{/key}
{/if}

{#if app.renaming}
	<Dialog title={t('board-rename')} onclose={() => (app.renaming = null)}>
		<TextField bind:value={name} label={t('board-name')} onkeydown={(event) => event.key === 'Enter' && rename()} />
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (app.renaming = null)}>{t('editor-cancel')}</button>
			<button type="button" class="button primary" onclick={rename}>{t('editor-save')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if app.removing}
	{@const board = app.removing}
	<ConfirmDialog
		title={t('board-remove-title', { name: board.name })}
		description={t('board-remove-detail', { count: board.sounds.length })}
		action={t('board-remove')}
		danger
		run={() => app.removeBoard(board.id)}
		onclose={() => (app.removing = null)}
	/>
{/if}
