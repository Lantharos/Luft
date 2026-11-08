<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, TextField } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import { library, type SubjectEntry } from '#lib/library/library.svelte.js';
	import { DEFAULT_PAPER, type Paper } from '#lib/library/model.js';
	import { focusField } from '#lib/shell/dialogs/focus.js';
	import PaperPicker from '#lib/paper/PaperPicker.svelte';

	let { subject, onclose }: { subject: SubjectEntry; onclose: () => void } = $props();

	let name = $state('');
	let paper: Paper = $state({ ...DEFAULT_PAPER });
	let trimmed = $derived(name.trim());

	async function create() {
		if (!trimmed) return;
		const notebook = await library.createNotebook(subject, trimmed, $state.snapshot(paper));
		onclose();
		session.open(notebook);
	}
</script>

<Dialog title={t('notebook-new-title', { subject: subject.meta.name })} wide {onclose}>
	<form id="new-notebook" {@attach focusField} class="flex flex-col gap-5" onsubmit={(event) => (event.preventDefault(), void create())}>
		<TextField bind:value={name} label={t('notebook-name')} placeholder={t('notebook-name-example')} />
		<PaperPicker bind:paper />
	</form>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="submit" form="new-notebook" class="button primary" disabled={!trimmed}>{t('notebook-create')}</button>
	{/snippet}
</Dialog>
