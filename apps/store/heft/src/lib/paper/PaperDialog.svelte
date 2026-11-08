<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, Segmented } from '@luft/ui';
	import { paperOf, type PageEntry } from '#lib/library/model.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import PaperPicker from './PaperPicker.svelte';

	let { notebook, page, onclose }: { notebook: OpenNotebook; page?: PageEntry; onclose: () => void } = $props();

	const own = untrack(() => !!page && !page.pdf);
	let scope: 'page' | 'notebook' = $state(untrack(() => (own && page!.paper ? 'page' : 'notebook')));
	let paper = $state(untrack(() => (own ? paperOf(notebook.meta, page!) : { ...notebook.meta.paper })));

	function save() {
		notebook.setPaper($state.snapshot(paper), page?.id, scope === 'page');
		onclose();
	}
</script>

<Dialog title={t('paper-title')} description={scope === 'page' ? t('paper-body-page') : t('paper-body')} wide {onclose}>
	{#if own}
		<Segmented
			label={t('paper-scope')}
			value={scope}
			options={[
				{ value: 'page', label: t('paper-this-page') },
				{ value: 'notebook', label: t('paper-every-page') }
			]}
			onchange={(next) => (scope = next)}
		/>
	{/if}
	<PaperPicker bind:paper />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" onclick={save}>{t('dialog-save')}</button>
	{/snippet}
</Dialog>
