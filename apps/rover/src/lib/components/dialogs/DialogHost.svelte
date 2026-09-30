<script lang="ts">
	import { onMount } from 'svelte';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { TrashCounter } from '$lib/file-manager/places/places.svelte';
	import * as features from '$lib/features/api';
	import { dialogs } from '$lib/features/dialogs.svelte';
	import { folderCounts } from '$lib/features/onscreen/folder-counts.svelte';
	import { history } from '$lib/features/history.svelte';
	import { search } from '$lib/features/search.svelte';
	import { thumbnailSize, thumbnails } from '$lib/features/onscreen/thumbnails.svelte';
	import { isDesktopRuntime } from '$lib/runtime';
	import { settings } from '$lib/state/settings.svelte';
	import CompressDialog from './archive/CompressDialog.svelte';
	import EmptyTrashDialog from './trash/EmptyTrashDialog.svelte';
	import ConflictDialog from './conflict/ConflictDialog.svelte';
	import PropertiesDialog from './properties/PropertiesDialog.svelte';
	import BatchRenameDialog from './rename/BatchRenameDialog.svelte';
	import SearchDialog from './search/SearchDialog.svelte';
	import UndoToast from './UndoToast.svelte';

	interface Props {
		manager: FileManager;
		trash: TrashCounter;
	}

	let { manager, trash }: Props = $props();

	const LIST_ICON_PIXELS = 32;

	let conflicted = $derived(manager.operations.find((operation) => operation.conflict));
	let dialog = $derived(dialogs.current);
	let pixels = $derived((manager.viewMode === 'grid' ? settings.value.gridSize : LIST_ICON_PIXELS) * window.devicePixelRatio);

	onMount(() => {
		if (!isDesktopRuntime()) return;
		const unsubscribe = [
			features.events.history(history.receive),
			features.events.thumbnails(thumbnails.receive),
			features.events.counts(folderCounts.receive),
			features.events.search(search.receive)
		];
		void features.historyState().then(history.receive);
		return () => unsubscribe.forEach((stop) => stop());
	});

	$effect(() => thumbnails.resize(thumbnailSize(pixels)));
</script>

<UndoToast />

{#if conflicted?.conflict}
	{#key conflicted.conflict.source.path}
		<ConflictDialog operation={conflicted} />
	{/key}
{/if}

{#if dialog?.kind === 'properties'}
	<PropertiesDialog entries={dialog.entries} onclose={dialogs.close} />
{:else if dialog?.kind === 'rename'}
	<BatchRenameDialog entries={dialog.entries} siblings={manager.entries} onclose={dialogs.close} />
{:else if dialog?.kind === 'compress'}
	<CompressDialog entries={dialog.entries} destination={dialog.destination} onclose={dialogs.close} />
{:else if dialog?.kind === 'empty-trash'}
	{@const trashPath = dialog.trashPath}
	<EmptyTrashDialog onconfirm={() => manager.actions.emptyTrash(trashPath).then(trash.refresh)} onclose={dialogs.close} />
{/if}

{#if search.open}
	<SearchDialog {manager} />
{/if}
