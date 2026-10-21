<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import { basename } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { CloudConflict, CloudDrive } from '#lib/types/cloud.js';

	let { manager }: { manager: FileManager } = $props();

	const PROVIDER_NAMES = { onedrive: 'OneDrive', dropbox: 'Dropbox', icloud: 'iCloud Drive', nextcloud: 'Nextcloud', webdav: 'the server' };

	let notes = $derived(manager.view === 'home' ? manager.cloud.conflictsIn(manager.currentPath) : []);

	function show(drive: CloudDrive, conflict: CloudConflict) {
		manager.selectOnly(`${drive.path}/${conflict.copy}`);
	}

	function dismiss(drive: CloudDrive, conflict: CloudConflict) {
		api.dismissConflict(drive.account, conflict.copy).catch(manager.notify);
	}
</script>

{#each notes as { drive, conflict } (conflict.copy)}
	<div class="cloud-note" role="status">
		<Copy size={16} class="flex-none text-[var(--text-muted)]" />
		<p class="min-w-0 flex-1">
			<strong>{basename(conflict.path)}</strong> changed on this computer and in {PROVIDER_NAMES[drive.provider]} at the same time. Both versions are kept;
			the other one is <strong>{basename(conflict.copy)}</strong>.
		</p>
		<button type="button" class="plain-button" onclick={() => show(drive, conflict)}>Show</button>
		<button type="button" class="plain-button" onclick={() => dismiss(drive, conflict)}>Dismiss</button>
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
