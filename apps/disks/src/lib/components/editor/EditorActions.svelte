<script lang="ts">
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { tooltip } from '@luft/ui';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { editor } from '#lib/editor/editor.svelte.js';

	let count = $derived(editor.steps.length);
</script>

{#if count && !editor.running}
	<button type="button" class="icon-button" aria-label="Undo" onclick={() => editor.undo()} {@attach tooltip('Undo')}>
		<Undo2 size={18} />
	</button>
	<button type="button" class="button primary mr-2" onclick={() => dialogs.open({ kind: 'apply-plan' })}>
		Apply {count === 1 ? 'change' : `${count} changes`}
	</button>
{/if}
