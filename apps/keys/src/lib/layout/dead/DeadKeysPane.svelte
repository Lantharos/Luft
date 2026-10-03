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
	<div class="flex max-w-[520px] flex-col items-start gap-4 pt-8">
		<div class="flex flex-col gap-2">
			<h2 class="text-[20px] font-semibold">Dead keys</h2>
			<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
				A dead key types nothing by itself and changes the next key instead, like a caron that turns a into ǎ. Each one has its own list of what the
				keys after it make, and can lead into another dead key.
			</p>
		</div>
		<button type="button" class="button primary" onclick={() => void editor.addDead()}><Plus size={16} />New dead key</button>
	</div>
{:else}
	<div class="grid items-start gap-8 min-[1000px]:grid-cols-[220px_minmax(0,1fr)]">
		<DeadKeyList {editor} />
		{#if own}
			{#key own.keysym}
				<DeadKeyEditor {editor} key={own} />
			{/key}
		{:else if standard}
			{#key standard.keysym}
				<StandardDeadKey {editor} symbol={standard} />
			{/key}
		{:else}
			<p class="pt-2 text-[14px] text-[var(--text-muted)]">Pick a dead key to see what it makes.</p>
		{/if}
	</div>
{/if}
