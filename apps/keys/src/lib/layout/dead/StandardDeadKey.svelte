<script lang="ts">
	import { onMount } from 'svelte';
	import { systemTable, type DeadKey, type Symbol } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import DeadKeyHeader from './DeadKeyHeader.svelte';
	import PairGrid from './PairGrid.svelte';
	import { standardName, whereIs } from './table';

	interface Props {
		editor: LayoutEditor;
		symbol: Symbol;
	}

	let { editor, symbol }: Props = $props();

	let table = $state<DeadKey | null>(null);
	let where = $derived(whereIs(editor.layout.keys, symbol.keysym));

	onMount(() => {
		void systemTable(symbol.keysym).then(({ spacing, pairs }) => {
			table = { keysym: symbol.keysym, name: standardName(symbol.keysym), symbol: symbol.text, spacing, pairs };
		});
	});
</script>

<div class="flex min-w-0 flex-col gap-5">
	<DeadKeyHeader symbol={symbol.text} name={standardName(symbol.keysym)} {where}>
		<button type="button" class="button" onclick={() => void editor.copySystem(symbol)}>Make an editable copy</button>
	</DeadKeyHeader>
	{#if table}
		<PairGrid key={table} readonly />
	{/if}
</div>
