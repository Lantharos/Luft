<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import type { Extension } from '#lib/bindings.js';
	import { extensions, type Unreviewed } from '../extensions.svelte';

	let { extension, how, onclose }: { extension: Extension; how: Unreviewed; onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	async function approve() {
		busy = true;
		error = '';
		try {
			await extensions.runUnreviewed(extension, how);
			onclose();
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog
	title={t(how === 'copy' ? 'settings-extensions-copy-title' : 'settings-extensions-folder-title', { name: extension.name })}
	onclose={() => !busy && onclose()}
>
	<p class="text-[13px] leading-relaxed">{t('settings-extensions-unreviewed-warning', { name: extension.name })}</p>
	{#if how === 'copy'}
		<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{t('settings-extensions-copy-explained')}</p>
	{:else}
		<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{t('settings-extensions-folder-explained')}</p>
		<p class="font-mono text-[12.5px] break-all select-text">{extension.path}</p>
		<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{t('settings-extensions-folder-only-yours')}</p>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('ui-dialog-cancel')}</button>
		<button type="button" class="button danger" disabled={busy} onclick={approve}>
			{t(how === 'copy' ? 'settings-extensions-copy' : 'settings-extensions-folder')}
		</button>
	{/snippet}
</Dialog>
