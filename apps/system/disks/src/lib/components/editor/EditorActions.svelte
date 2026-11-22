<script lang="ts">
	import { t } from '@luft/i18n';
	import Undo2 from '@luft/symbols/icons/undo-2';
	import { tooltip } from '@luft/ui';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import PlanMenu from './PlanMenu.svelte';
</script>

{#if editor.outcome}
	<button type="button" class="button" onclick={() => (editor.outcome = null)}>{t('disks-editor-keep-editing')}</button>
	<button type="button" class="button primary mr-2" onclick={() => editor.close()}>{t('disks-done')}</button>
{:else if editor.steps.length && !editor.running}
	<button type="button" class="icon-button" aria-label={t('disks-editor-undo')} onclick={() => editor.undo()} {@attach tooltip(t('disks-editor-undo'))}>
		<Undo2 size={18} />
	</button>
	<PlanMenu />
	<button type="button" class="button primary mr-2" onclick={() => dialogs.open({ kind: 'apply-plan' })}>{t('disks-editor-apply')}</button>
{/if}
