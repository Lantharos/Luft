<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Segmented } from '@luft/ui';
	import Page from '$lib/shell/Page.svelte';
	import SourceActions from '$lib/shell/SourceActions.svelte';
	import { app } from '$lib/state/app.svelte';
	import { toast } from '$lib/state/toast.svelte';
	import { deleteMethod, exportMethod, openMethod, useMethod } from './api';
	import { MethodEditor, type Table } from './editor.svelte';
	import EntryTable from './EntryTable.svelte';
	import MethodDetails from './MethodDetails.svelte';
	import TryMethod from './TryMethod.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	let editor = $state<MethodEditor | null>(null);
	let table = $state<Table>('rules');

	let tables = $derived(
		editor
			? [
					{ value: 'rules' as const, label: `Replacements ${editor.rules.length || ''}`.trim() },
					{ value: 'words' as const, label: `Words ${editor.words.length || ''}`.trim() },
					{ value: 'sequences' as const, label: `Sequences ${editor.sequences.length || ''}`.trim() }
				]
			: []
	);

	onMount(() => {
		openMethod(id)
			.then((method) => {
				editor = new MethodEditor(method, () => void app.refresh());
				table = method.rules.length || !method.words.length ? 'rules' : 'words';
			})
			.catch((error) => {
				toast.failed(error);
				app.select(app.first());
			});
	});

	onDestroy(() => void editor?.save());

	async function remove() {
		editor?.discard();
		await deleteMethod(id);
		await app.removed();
	}
</script>

{#if editor}
	{@const current = editor}
	<Page title={current.method.name} wide>
		{#snippet actions()}
			<SourceActions
				selection={{ kind: 'method', id }}
				what="input method"
				onuse={() => useMethod(id)}
				exports={[{ label: 'Export input method', run: () => exportMethod(id) }]}
				onremove={remove}
			/>
		{/snippet}
		<div class="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-8">
			<div class="flex min-w-0 flex-col gap-7">
				<section class="flex flex-col gap-4">
					<Segmented label="What to edit" options={tables} value={table} onchange={(value) => (table = value)} />
					{#if table === 'rules'}
						<EntryTable
							editor={current}
							table="rules"
							add="Add replacement"
							context
							empty="Replacements turn what you type into something else as you go, like a' into á. The longest match wins, so a and a' can both have their own."
						/>
					{:else if table === 'words'}
						<EntryTable
							editor={current}
							table="words"
							add="Add word"
							empty="Words offer choices while you type, like ni giving 你 and 尼. Pick one with its number or Space."
						/>
					{:else}
						<EntryTable
							editor={current}
							table="sequences"
							add="Add sequence"
							empty="Sequences start with the sequence key, like the key, then a and e for æ."
						/>
					{/if}
				</section>
				<MethodDetails editor={current} />
			</div>
			<section class="sticky top-2 flex flex-col gap-2">
				<h2 class="px-1.5 text-[14px] font-semibold text-[var(--text-soft)]">Try it</h2>
				<TryMethod />
			</section>
		</div>
	</Page>
{/if}
