<script lang="ts">
	import Plus from '@luft/symbols/icons/plus';
	import { selectionPill, tooltip } from '@luft/ui';
	import { t } from '@luft/i18n';
	import type { Board } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import MixPanel from './MixPanel.svelte';

	function open(event: MouseEvent, board: Board) {
		event.preventDefault();
		app.menu = { kind: 'board', board, at: { x: event.clientX, y: event.clientY } };
	}
</script>

<aside class="glass-sidebar drag-region gap-3 px-3 py-4">
	<div class="nav-heading">
		<h2>{t('boards-title')}</h2>
		<button type="button" class="nav-action" aria-label={t('board-new')} {@attach tooltip(t('board-new'))} onclick={() => void app.addBoard()}>
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
				<span class="nav-count">{board.sounds.length}</span>
			</button>
		{/each}
	</nav>
	<MixPanel />
</aside>

