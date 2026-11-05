<script lang="ts">
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { tooltip } from '@luft/ui';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import PlanMenu from './PlanMenu.svelte';
</script>

{#if editor.outcome}
	<button type="button" class="button" onclick={() => (editor.outcome = null)}>Keep editing</button>
	<button type="button" class="button primary mr-2" onclick={() => editor.close()}>Done</button>
{:else if editor.steps.length && !editor.running}
	<button type="button" class="icon-button" aria-label="Undo" onclick={() => editor.undo()} {@attach tooltip('Undo')}>
		<Undo2 size={18} />
	</button>
	<PlanMenu />
	<button type="button" class="button primary mr-2" onclick={() => dialogs.open({ kind: 'apply-plan' })}>Apply</button>
{/if}
