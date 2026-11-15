<script lang="ts">
	import { t } from '@luft/i18n';
	import { useApp } from '#lib/app/context.js';
	import { keepMine } from '#lib/documents/disk.js';
	import type { Document } from '#lib/documents/document.svelte.js';
	import { reload } from '#lib/documents/opening.js';
	import { save } from '#lib/documents/saving.js';

	let { document }: { document: Document } = $props();

	const app = useApp();
</script>

<div class="disk-bar" role="status">
	{#if document.disk === 'changed'}
		<span class="flex-1 truncate">{t('draft-disk-changed')}</span>
		<button type="button" class="plain-button" onclick={() => void keepMine(document)}>{t('draft-disk-keep')}</button>
		<button type="button" class="button" onclick={() => void reload(app.workspace, document)}>{t('draft-disk-reload')}</button>
	{:else}
		<span class="flex-1 truncate">{t('draft-disk-deleted')}</span>
		<button type="button" class="button" onclick={() => void save(app.workspace, document)}>{t('draft-disk-save-again')}</button>
	{/if}
</div>

<style>
	.disk-bar {
		display: flex;
		flex: none;
		align-items: center;
		gap: 8px;
		margin: 0 12px 8px;
		border-radius: 16px;
		background: var(--accent-soft);
		padding: 6px 6px 6px 16px;
		font-size: 13px;
	}

	.disk-bar .button,
	.disk-bar .plain-button {
		min-height: 30px;
	}
</style>
