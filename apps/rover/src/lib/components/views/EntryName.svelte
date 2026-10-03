<script lang="ts">
	import InlineNameField from '#lib/components/pane/InlineNameField.svelte';
	import { defaultName, type FileManager } from '#lib/file-manager/manager.svelte.js';
	import { DRAFT_PATH } from '#lib/file-manager/view/draft.js';
	import type { FileEntry } from '#lib/types/index.js';

	interface Props {
		entry: FileEntry;
		manager: FileManager;
		class?: string;
		fieldClass?: string;
	}

	let { entry, manager, class: className = '', fieldClass = '' }: Props = $props();

	let draft = $derived(manager.draft);
	let creating = $derived(entry.path === DRAFT_PATH);
	let editing = $derived(creating || (draft?.mode === 'rename' && draft.targetPath === entry.path));
</script>

{#if editing && draft}
	<InlineNameField
		class={fieldClass}
		value={draft.value}
		label={draft.itemType === 'folder' ? 'Folder name' : 'File name'}
		unchangedValue={creating ? defaultName(draft.itemType) : entry.name}
		placeholder={creating ? defaultName(draft.itemType) : ''}
		selectStem={entry.is_file}
		onInput={manager.updateDraft}
		onConfirm={manager.commitDraft}
		onCancel={manager.cancelDraft}
	/>
{:else}
	<span class={['entry-name', className]}>{entry.name}</span>
{/if}
