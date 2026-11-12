<script lang="ts">
	import { t } from '@luft/i18n';
	import { errorText, Row, Section } from '@luft/ui';
	import type { Extension } from '#lib/bindings.js';
	import { extensions, type Unreviewed } from '../extensions.svelte';
	import UnreviewedDialog from './UnreviewedDialog.svelte';

	let { extension }: { extension: Extension } = $props();

	let asking = $state<Unreviewed | null>(null);
	let busy = $state(false);
	let error = $state('');

	async function run(work: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await work();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

{#snippet failure()}
	<p class="text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if extension.origin === 'own' && extensions.developerTools}
	<Section title={t('settings-extensions-inside')} description={t('settings-extensions-inside-description')}>
		<Row title={t('settings-extensions-copy')} description={t('settings-extensions-copy-description')} onclick={() => (asking = 'copy')} />
		<Row title={t('settings-extensions-folder')} description={t('settings-extensions-folder-description')} onclick={() => (asking = 'folder')} />
	</Section>
{:else if extension.origin === 'copy' || extension.origin === 'folder'}
	<Section title={t('settings-extensions-inside')}>
		{#if extension.origin === 'folder' && extensions.developerTools}
			<Row title={t('settings-extensions-reload')} description={t('settings-extensions-reload-description')}>
				<button type="button" class="button" disabled={busy} onclick={() => run(() => extensions.reload(extension))}>{t('settings-extensions-reload-action')}</button>
			</Row>
		{/if}
		{#if extensions.developerTools}
			<Row
				title={t('settings-extensions-stop-inside')}
				description={t(extension.origin === 'copy' ? 'settings-extensions-stop-copy-description' : 'settings-extensions-stop-folder-description')}
				below={error ? failure : undefined}
			>
				<button type="button" class="button" disabled={busy} onclick={() => run(() => extensions.stopUnreviewed(extension))}>{t('settings-extensions-stop')}</button>
			</Row>
		{:else}
			<Row title={t('settings-extensions-forget')} description={t('settings-extensions-forget-description')} below={error ? failure : undefined}>
				<button type="button" class="button" disabled={busy} onclick={() => run(() => extensions.stopUnreviewed(extension))}>{t('settings-extensions-forget-action')}</button>
			</Row>
		{/if}
	</Section>
{/if}

{#if asking}
	<UnreviewedDialog {extension} how={asking} onclose={() => (asking = null)} />
{/if}
