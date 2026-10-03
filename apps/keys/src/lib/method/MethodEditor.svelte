<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Segmented } from '@luft/ui';
	import Page from '#lib/shell/Page.svelte';
	import SourceActions from '#lib/shell/SourceActions.svelte';
	import UndoButtons from '#lib/shell/UndoButtons.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import { deleteMethod, exportMethod, openMethod, useMethod } from './api';
	import { MethodEditor, type Tab } from './editor.svelte';
	import EntryTable from './EntryTable.svelte';
	import MethodSettings from './MethodSettings.svelte';
	import TryMethod from './TryMethod.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	const TABS: { value: Tab; label: string }[] = [
		{ value: 'rules', label: 'Replacements' },
		{ value: 'words', label: 'Words' },
		{ value: 'sequences', label: 'Sequences' },
		{ value: 'settings', label: 'Settings' }
	];
	const TAB_SHORTCUTS: Record<string, Tab> = { Digit1: 'rules', Digit2: 'words', Digit3: 'sequences', Digit4: 'settings' };

	let editor = $state<MethodEditor | null>(null);

	onMount(() => {
		openMethod(id)
			.then((method) => (editor = new MethodEditor(method, () => void app.refresh())))
			.catch((error) => {
				toast.failed(error);
				app.select(app.first());
			});
	});

	onDestroy(() => void editor?.save());

	function switchTab(event: KeyboardEvent) {
		const tab = TAB_SHORTCUTS[event.code];
		if (!editor || !tab || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
		event.preventDefault();
		editor.tab = tab;
	}

	async function remove() {
		editor?.discard();
		await deleteMethod(id);
		await app.removed();
	}
</script>

<svelte:window onkeydown={switchTab} />

{#if editor}
	{@const current = editor}
	<Page title={current.method.name} wide>
		{#snippet actions()}
			<UndoButtons target={current} />
			<SourceActions
				selection={{ kind: 'method', id }}
				what="input method"
				onuse={() => useMethod(id)}
				exports={[{ label: 'Export input method', run: () => exportMethod(id) }]}
				onremove={remove}
			/>
		{/snippet}
		<div class="grid items-start gap-8 min-[1100px]:grid-cols-[minmax(0,1fr)_340px]">
			<div class="flex min-w-0 flex-col gap-6">
				<div class="w-[440px] max-w-full">
					<Segmented label="What to edit" options={TABS} value={current.tab} onchange={(tab) => (current.tab = tab)} />
				</div>
				{#if current.tab === 'rules'}
					<EntryTable editor={current} table="rules" add="Add replacement" context empty="No replacements yet" />
				{:else if current.tab === 'words'}
					<EntryTable editor={current} table="words" add="Add word" empty="No words yet" />
				{:else if current.tab === 'sequences'}
					<EntryTable editor={current} table="sequences" add="Add sequence" empty="No sequences yet" />
				{:else}
					<MethodSettings editor={current} />
				{/if}
			</div>
			<section class="min-[1100px]:sticky min-[1100px]:top-2">
				<TryMethod editor={current} />
			</section>
		</div>
	</Page>
{/if}
