<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import { save } from '#lib/documents/saving.js';

	const app = useApp();
	let request = $derived(app.workspace.closeRequest);
	let saving = $state(false);

	let title = $derived.by(() => {
		if (!request) return '';
		const [first] = request.documents;
		return request.documents.length === 1 ? `Save changes to “${first.name}”?` : `Save changes to ${request.documents.length} files?`;
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
	<Dialog {title} description="Your changes will be lost if you don’t save them." onclose={() => request.resolve(false)}>
		{#snippet actions()}
			<button type="button" class="button danger mr-auto" onclick={() => request.resolve(true)}>Don’t save</button>
			<button type="button" class="button" onclick={() => request.resolve(false)}>Cancel</button>
			<button type="button" class="button primary" disabled={saving} onclick={() => void saveAndClose()}>Save</button>
		{/snippet}
	</Dialog>
{/if}
