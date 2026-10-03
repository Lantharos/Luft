<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Segmented } from '@luft/ui';
	import Page from '$lib/shell/Page.svelte';
	import SourceActions from '$lib/shell/SourceActions.svelte';
	import UndoButtons from '$lib/shell/UndoButtons.svelte';
	import { app } from '$lib/state/app.svelte';
	import { toast } from '$lib/state/toast.svelte';
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
				<Segmented label="What to edit" options={TABS} value={current.tab} onchange={(tab) => (current.tab = tab)} />
				{#if current.tab === 'rules'}
					<EntryTable
						editor={current}
						table="rules"
						add="Add replacement"
						context
						empty="Replacements turn what you type into something else as you go, like a' into á. The longest match wins, so a and a' can both have their own."
					/>
				{:else if current.tab === 'words'}
					<EntryTable editor={current} table="words" add="Add word" empty="Words offer choices while you type, like ni giving 你 and 尼. Pick one with its number or Space." />
				{:else if current.tab === 'sequences'}
					<EntryTable editor={current} table="sequences" add="Add sequence" empty="Sequences start with the sequence key, then a few keys, like a and e for æ." />
				{:else}
					<MethodSettings editor={current} />
				{/if}
			</div>
			<section class="flex flex-col gap-2 min-[1100px]:sticky min-[1100px]:top-2">
				<h2 class="px-1.5 text-[14px] font-semibold text-[var(--text-soft)]">Try it</h2>
				<TryMethod />
			</section>
		</div>
	</Page>
{/if}
