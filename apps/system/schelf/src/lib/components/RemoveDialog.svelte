<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { InstalledApp } from '#lib/bindings.js';
	import { removeJob } from '#lib/app/jobs.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { app, onclose }: { app: InstalledApp; onclose: () => void } = $props();

	const description = $derived.by(() => {
		if (app.source === 'extension') return t('remove-extension', { name: app.name });
		if (app.source === 'appImage') return t('remove-appimage', { name: app.name, folder: app.origin });
		if (app.source === 'debian') return t('remove-app', { name: app.name });
		if (app.source === 'system') return t('remove-system', { name: app.name });
		if (app.source === 'flatpak') return t('remove-flatpak', { name: app.name });
		return t('remove-app', { name: app.name });
	});

	function remove() {
		void operations.run(app.key, app.name, removeJob(app));
		onclose();
	}
</script>

<Dialog title={t('remove-title', { name: app.name })} {description} {onclose}>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('remove-cancel')}</button>
		<button type="button" class="button danger" onclick={remove}>{t('remove-confirm')}</button>
	{/snippet}
</Dialog>
