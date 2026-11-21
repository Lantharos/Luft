<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import FileDetails from '#lib/files/FileDetails.svelte';
	import type { FileInstall } from '#lib/files/install.svelte.js';

	let { install, onclose }: { install: FileInstall; onclose: () => void } = $props();
</script>

<Dialog title={install.name} wide {onclose}>
	<div class="flex flex-col gap-5">
		<FileDetails {install} />
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('install-close')}</button>
	{/snippet}
</Dialog>
