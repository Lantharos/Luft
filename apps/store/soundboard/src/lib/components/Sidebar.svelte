<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
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
