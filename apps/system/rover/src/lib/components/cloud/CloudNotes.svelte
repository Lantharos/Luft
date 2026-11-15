<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import { t } from '@luft/i18n';
	import { basename } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { CloudConflict, Drive } from '#lib/bindings.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { marks } from '#lib/utils/marks.js';

	let { manager }: { manager: FileManager } = $props();

	const PROVIDER_NAMES = { onedrive: 'OneDrive', dropbox: 'Dropbox', icloud: 'iCloud Drive', nextcloud: 'Nextcloud' };

	let notes = $derived(manager.view === 'home' ? manager.cloud.conflictsIn(manager.currentPath) : []);

	function note(drive: Drive, conflict: CloudConflict) {
		const names = marks({ file: basename(conflict.path), copy: basename(conflict.copy) });
		const text =
			drive.provider === 'webdav'
				? t('rover-cloud-conflict-server', names.args)
				: t('rover-cloud-conflict', { ...names.args, provider: PROVIDER_NAMES[drive.provider] });
		return names.split(text);
	}

	function show(drive: Drive, conflict: CloudConflict) {
		manager.selectOnly(`${drive.path}/${conflict.copy}`);
	}

	function dismiss(drive: Drive, conflict: CloudConflict) {
		commands.cloudDismissConflict({ account: drive.account, copy: conflict.copy }).catch(manager.notify);
	}
</script>

{#each notes as { drive, conflict } (conflict.copy)}
	<div class="cloud-note" role="status">
		<Copy size={16} class="flex-none text-[var(--text-muted)]" />
		<p class="min-w-0 flex-1">
			{#each note(drive, conflict) as piece, index (index)}{#if piece.key}<strong>{piece.text}</strong>{:else}{piece.text}{/if}{/each}
		</p>
		<button type="button" class="plain-button" onclick={() => show(drive, conflict)}>{t('rover-cloud-conflict-show')}</button>
		<button type="button" class="plain-button" onclick={() => dismiss(drive, conflict)}>{t('rover-dismiss')}</button>

	</div>
{/each}

<style>
	.cloud-note {
		display: flex;
		flex: none;
		align-items: center;
		gap: 12px;
		margin: 4px 16px 8px;
		padding: 8px 8px 8px 14px;
		border-radius: 14px;
		background: var(--surface-hover);
		color: var(--text-soft);
		font-size: 13px;
		line-height: 1.45;
	}

	.cloud-note strong {
		color: var(--text);
		font-weight: 550;
	}
</style>
