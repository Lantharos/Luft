<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { LayoutEditor } from '../editor.svelte';
	import DeadKeyEditor from './DeadKeyEditor.svelte';
	import DeadKeyList from './DeadKeyList.svelte';
	import StandardDeadKey from './StandardDeadKey.svelte';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let own = $derived(editor.dead(editor.chosenDead));
	let standard = $derived(own ? undefined : editor.systemDead.find((symbol) => symbol.keysym === editor.chosenDead));
	let empty = $derived(!editor.layout.dead.length && !editor.systemDead.length);
</script>

{#if empty}
	<div class="flex flex-col items-center gap-4 pt-16 text-center">
		<span class="text-[40px] leading-none text-[var(--text-muted)]" aria-hidden="true">ˇ</span>
		<p class="text-[15px] text-[var(--text-soft)]">No dead keys yet</p>
		<button type="button" class="button" onclick={() => void editor.addDead()}><Plus size={16} />New dead key</button>
	</div>
{:else}
	<div class="grid items-start gap-8 min-[1000px]:grid-cols-[200px_minmax(0,1fr)]">
		<DeadKeyList {editor} />
		{#if own}
			{#key own.keysym}
				<DeadKeyEditor {editor} key={own} />
			{/key}
		{:else if standard}
			{#key standard.keysym}
				<StandardDeadKey {editor} symbol={standard} />
			{/key}
		{/if}
	</div>
{/if}
