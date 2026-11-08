<script lang="ts">
	import { t } from '@luft/i18n';
	import { ContextMenu, MenuItem, relativeDay } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import { draggable, dropTarget } from '#lib/drag/drag.svelte.js';
	import { library, type NotebookEntry } from '#lib/library/library.svelte.js';

	let { notebook, color }: { notebook: NotebookEntry; color: string } = $props();

	let menu: { x: number; y: number } | null = $state(null);

	async function trash() {
		menu = null;
		await library.trashNotebook(notebook);
		session.prune();
	}
</script>

<button
	type="button"
	class="cover"
	style:--cover={color}
	{@attach draggable(
		() => ({ kind: 'notebook', id: notebook.meta.id }),
		() => notebook.meta.name
	)}
	{@attach dropTarget({ kind: 'notebook', id: notebook.meta.id })}
	onclick={() => session.open(notebook)}
	oncontextmenu={(event) => (event.preventDefault(), (menu = { x: event.clientX, y: event.clientY }))}
>
	<span class="book">
		<span class="spine"></span>
		<span class="label">{notebook.meta.name}</span>
	</span>
	<span class="text-[11.5px] text-(--text-muted)">
		{t('home-pages', { count: notebook.meta.pages.length })} · {relativeDay(Math.floor(notebook.meta.modified / 1000))}
	</span>
</button>

{#if menu}
	<ContextMenu at={menu} onclose={() => (menu = null)}>
		<MenuItem onclick={() => ((menu = null), session.open(notebook))}>{t('notebook-open')}</MenuItem>
		<MenuItem danger onclick={() => void trash()}>{t('notebook-trash')}</MenuItem>
	</ContextMenu>
{/if}

<style>
	.cover {
		display: flex;
		width: 104px;
		flex: none;
		flex-direction: column;
		gap: 8px;
		text-align: left;
	}

	.book {
		position: relative;
		display: flex;
		aspect-ratio: 3 / 4;
		align-items: flex-end;
		overflow: hidden;
		border-radius: 6px 12px 12px 6px;
		background: color-mix(in oklab, var(--cover) 82%, black);
		padding: 12px 12px 14px 22px;
		box-shadow:
			0 1px 0 color-mix(in oklab, white 18%, transparent) inset,
			0 10px 24px var(--shadow-faint);
		transition: transform var(--motion-quick) var(--ease-decelerate);
	}

	.cover:hover .book {
		transform: translateY(-3px);
	}

	.cover:active .book {
		transform: scale(0.97);
	}

	.spine {
		position: absolute;
		inset: 0 auto 0 0;
		width: 10px;
		background: color-mix(in oklab, var(--cover) 60%, black);
	}

	.label {
		color: white;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	.cover:global([data-drop-over]) .book {
		outline: 3px solid var(--accent-line);
		outline-offset: 3px;
	}
</style>
