<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { Paper } from '#lib/library/model.js';
	import PaperPicker from './PaperPicker.svelte';

	let { paper: initial, onsave, onclose }: { paper: Paper; onsave: (paper: Paper) => void; onclose: () => void } = $props();

	let paper = $state(untrack(() => ({ ...initial })));
</script>

<Dialog title={t('paper-title')} description={t('paper-body')} wide {onclose}>
	<PaperPicker bind:paper />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" onclick={() => (onsave($state.snapshot(paper)), onclose())}>{t('dialog-save')}</button>
	{/snippet}
</Dialog>
