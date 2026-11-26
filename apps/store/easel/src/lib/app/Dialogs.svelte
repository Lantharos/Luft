<script lang="ts">
	import ExportDialog from '#lib/dialogs/ExportDialog.svelte';
	import HistoryDialog from '#lib/dialogs/HistoryDialog.svelte';
	import NewImageDialog from '#lib/dialogs/NewImageDialog.svelte';
	import ResizeDialog from '#lib/dialogs/ResizeDialog.svelte';
	import SaveBackDialog from '#lib/dialogs/SaveBackDialog.svelte';
	import UnsavedDialog from '#lib/dialogs/UnsavedDialog.svelte';
	import { formatOf } from '#lib/files/export.js';
	import { useApp } from './context';
	import { exportSize, runExport } from './exporting';

	const app = useApp();
	const close = () => (app.dialog = null);
	let screen = $derived(app.screen);
</script>

{#if app.dialog === 'new-image'}
	<NewImageDialog oncreate={(width, height, background) => void app.newImage(width, height, background)} onclose={close} />
{:else if app.dialog === 'export' && screen.kind !== 'home'}
	{@const size = exportSize(app)}
	<ExportDialog width={size.width} height={size.height} vector={screen.kind === 'board'} run={(choice) => runExport(app, choice)} onclose={close} />
{:else if app.dialog === 'history' && screen.kind === 'editor'}
	<HistoryDialog history={screen.editor.doc.history} onclose={close} />
{:else if app.dialog === 'resize' && screen.kind === 'editor'}
	<ResizeDialog width={screen.editor.doc.width} height={screen.editor.doc.height} onresize={(width, height) => app.resize(width, height)} onclose={close} />
{:else if app.dialog === 'save-back' && screen.kind === 'quick'}
	<SaveBackDialog name={screen.name} replaceable={formatOf(screen.path) !== null} onchoose={(choice) => void app.saveBack(choice)} />
{:else if app.dialog === 'unsaved'}
	<UnsavedDialog name={app.name} onchoose={(choice) => app.answerLeave(choice)} />
{/if}
