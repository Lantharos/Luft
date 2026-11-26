<script lang="ts">
	import DevelopDialog from '#lib/adjust/DevelopDialog.svelte';
	import ExportDialog from '#lib/dialogs/ExportDialog.svelte';
	import HistoryDialog from '#lib/dialogs/HistoryDialog.svelte';
	import NewBoardDialog from '#lib/dialogs/NewBoardDialog.svelte';
	import NewImageDialog from '#lib/dialogs/NewImageDialog.svelte';
	import ResizeDialog from '#lib/dialogs/ResizeDialog.svelte';
	import SaveBackDialog from '#lib/dialogs/SaveBackDialog.svelte';
	import UnsavedDialog from '#lib/dialogs/UnsavedDialog.svelte';
	import { formatOf } from '#lib/files/export.js';
	import { useApp } from './context';
	import { exportAreas, exportSize, runExport } from './exporting';
	import ModelDialog from '#lib/ai/ModelDialog.svelte';
	import { models } from '#lib/ai/models.svelte.js';

	const app = useApp();
	const close = () => (app.dialog = null);
	let screen = $derived(app.screen);
</script>

{#if app.dialog === 'new-image'}
	<NewImageDialog oncreate={(width, height, background) => void app.newImage(width, height, background)} onclose={close} />
{:else if app.dialog === 'new-board'}
	<NewBoardDialog oncreate={(template) => void app.newBoard(template)} onclose={close} />
{:else if app.dialog === 'develop' && app.developing}
	<DevelopDialog development={app.developing} onclose={() => app.finishDeveloping()} />
{:else if app.dialog === 'export' && screen.kind !== 'home'}
	{@const areas = exportAreas(app)}
	<ExportDialog size={(area) => exportSize(app, area)} {areas} vector={screen.kind === 'board'} run={(choice) => runExport(app, choice)} onclose={close} />
{:else if app.dialog === 'history' && screen.kind === 'editor'}
	<HistoryDialog history={screen.editor.doc.history} onclose={close} />
{:else if app.dialog === 'resize' && screen.kind === 'editor'}
	<ResizeDialog width={screen.editor.doc.width} height={screen.editor.doc.height} onresize={(width, height) => app.resize(width, height)} onclose={close} />
{:else if app.dialog === 'save-back' && screen.kind === 'quick'}
	<SaveBackDialog name={screen.name} replaceable={formatOf(screen.path) !== null} onchoose={(choice) => void app.saveBack(choice)} />
{:else if app.dialog === 'unsaved'}
	<UnsavedDialog name={app.name} onchoose={(choice) => app.answerLeave(choice)} />
{/if}

{#if models.asking}
	<ModelDialog />
{/if}
