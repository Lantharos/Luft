<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import { save } from '#lib/documents/saving.js';

	const app = useApp();
	let request = $derived(app.workspace.closeRequest);
	let saving = $state(false);

	let title = $derived.by(() => {
		if (!request) return '';
		const [first] = request.documents;
		return request.documents.length === 1 ? t('draft-close-title', { name: first.name }) : t('draft-close-title-files', { count: request.documents.length });
	});

	async function saveAndClose() {
		if (!request) return;
		saving = true;
		for (const document of request.documents) {
			if (!(await save(app.workspace, document))) {
				saving = false;
				return;
			}
		}
		saving = false;
		request.resolve(true);
	}
</script>

{#if request}
	<Dialog {title} description={t('draft-close-description')} onclose={() => request.resolve(false)}>
		{#snippet actions()}
			<button type="button" class="button danger mr-auto" onclick={() => request.resolve(true)}>{t('draft-close-discard')}</button>
			<button type="button" class="button" onclick={() => request.resolve(false)}>{t('draft-close-cancel')}</button>
			<button type="button" class="button primary" disabled={saving} onclick={() => void saveAndClose()}>{t('draft-close-save')}</button>
		{/snippet}
	</Dialog>
{/if}
