<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';

	let { manager }: { manager: FileManager } = $props();

	let drive = $derived.by(() => {
		if (manager.view !== 'home') return undefined;
		const holding = manager.drives.containing(manager.currentPath);
		return holding?.foreign && !manager.drives.understood.has(holding.mountPoint) ? holding : undefined;
	});
	let command = $derived(drive && `sudo chown -R "$USER": "${drive.mountPoint}"`);

	function copy() {
		if (command) navigator.clipboard.writeText(command).catch(manager.notify);
	}
</script>

{#if drive && command}
	{@const mountPoint = drive.mountPoint}
	<div class="drive-note" role="status">
		<Lock size={16} class="flex-none text-[var(--text-muted)]" />
		<p class="min-w-0 flex-1">
			The files on <strong>{drive.name}</strong> belong to another account, perhaps from a system that was here before, so you can open them but not change them. To make them yours,
			run <code>{command}</code> in Tern.
		</p>
		<button type="button" class="plain-button" onclick={copy}>Copy command</button>
		<button type="button" class="plain-button" onclick={() => manager.drives.understood.add(mountPoint)}>Dismiss</button>
	</div>
{/if}

<style>
	.drive-note {
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

	.drive-note strong {
		color: var(--text);
		font-weight: 550;
	}

	.drive-note code {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text);
		overflow-wrap: anywhere;
	}
</style>
