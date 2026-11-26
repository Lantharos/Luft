<script lang="ts">
	import Ellipsis from '@luft/symbols/icons/ellipsis';
	import Redo from '@luft/symbols/icons/redo-2';
	import Undo from '@luft/symbols/icons/undo-2';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, MenuSeparator, tooltip, WindowControls } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import type { Editor } from './editor.svelte';
	import ZoomMenu from './ZoomMenu.svelte';
	import { FILTERS, filterName } from '#lib/filters/filters.js';

	interface Props {
		editor: Editor;
		name: string;
	}

	let { editor, name }: Props = $props();
	const app = useApp();
	let doc = $derived(editor.doc);
</script>

<header class="drag-region flex h-14 flex-none items-center gap-1.5 pr-3 pl-5">
	<h1 class="truncate text-[15px] font-semibold">{name}{doc.history.modified ? ' •' : ''}</h1>
	<span class="ml-1 text-[13px] whitespace-nowrap text-(--text-muted) tabular-nums">{doc.width} × {doc.height}</span>
	<div class="flex-1"></div>
	<button type="button" class="icon-button" aria-label={t('easel-undo')} disabled={!doc.history.canUndo} onclick={() => editor.undo()} {@attach tooltip(t('easel-undo'))}><Undo size={18} /></button>
	<button type="button" class="icon-button" aria-label={t('easel-redo')} disabled={!doc.history.canRedo} onclick={() => editor.redo()} {@attach tooltip(t('easel-redo'))}><Redo size={18} /></button>
	<ZoomMenu viewport={editor.viewport} width={doc.width} height={doc.height} />
	<MenuButton label={t('easel-more')} class="icon-button" align="end">
		{#snippet trigger()}<Ellipsis size={18} />{/snippet}
		{#snippet children(close)}
			<MenuItem onclick={() => (close(), app.save())}>{t('easel-save')}</MenuItem>
			<MenuItem onclick={() => (close(), app.save(true))}>{t('easel-save-as')}</MenuItem>
			<MenuSeparator />
			<MenuItem onclick={() => (close(), (app.dialog = 'history'))}>{t('easel-history')}</MenuItem>
			<MenuItem onclick={() => (close(), (app.dialog = 'resize'))}>{t('easel-resize')}</MenuItem>
			<MenuItem checked={editor.settings.rulers} onclick={() => (close(), (editor.settings.rulers = !editor.settings.rulers))}>{t('easel-rulers')}</MenuItem>
			<MenuItem checked={editor.settings.snapping} onclick={() => (close(), (editor.settings.snapping = !editor.settings.snapping))}>{t('easel-snapping')}</MenuItem>
			<MenuSeparator />
			{#each FILTERS as filter (filter)}
				<MenuItem disabled={!doc.active.paintable} onclick={() => (close(), editor.finishTool(), (editor.panel = { kind: 'filter', filter }))}>{filterName[filter]()}</MenuItem>
			{/each}
			<MenuSeparator />
			<MenuItem onclick={() => (close(), (app.dialog = 'new-image'))}>{t('easel-new-image')}</MenuItem>
			<MenuItem onclick={() => (close(), app.newBoard())}>{t('easel-new-board')}</MenuItem>
			<MenuItem onclick={() => (close(), app.chooseAndOpen())}>{t('easel-open')}</MenuItem>
		{/snippet}
	</MenuButton>
	<button type="button" class="button primary ml-1.5" onclick={() => (app.dialog = 'export')}>{t('easel-export')}</button>
	<div class="ml-2.5">
		<WindowControls onclose={() => app.close()} />
	</div>
</header>
