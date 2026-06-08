<script lang="ts">
	import EntryIcon from '$lib/components/file-manager/EntryIcon.svelte';
	import type { FileEntry } from '$lib/types';
	import { getFileIcon } from '$lib/utils';

	type FileIcon = 'folder' | 'file' | 'image' | 'video' | 'music' | 'archive' | 'code' | 'file-text' | 'package';

	interface Props {
		entries: FileEntry[];
		thumbnails: Record<string, string | null>;
		x: number;
		y: number;
		copy?: boolean;
	}

	let { entries, thumbnails, x, y, copy = false }: Props = $props();
	let visibleEntries = $derived(entries.slice(0, 3));

	function entryIcon(entry: FileEntry): FileIcon {
		const icon = getFileIcon(entry);
		if (icon === 'audio') return 'music';
		if (['pdf', 'document', 'spreadsheet', 'presentation'].includes(icon)) return 'file-text';
		if (icon === 'package') return 'package';
		if (icon === 'executable') return 'code';
		if (['folder', 'file', 'image', 'video', 'music', 'archive', 'code'].includes(icon)) return icon as FileIcon;
		return 'file';
	}
</script>

{#if entries.length > 0}
	<div class="drag-bundle" style:transform={`translate3d(${x + 14}px, ${y + 14}px, 0)`} aria-hidden="true">
		<div class="drag-bundle__body">
			{#each visibleEntries as entry, index (entry.path)}
				<div class="drag-bundle__row" style:--row-index={index}>
					<EntryIcon name={entryIcon(entry)} thumbnail={thumbnails[entry.path] ?? null} />
					<span>{entry.name}{entry.is_dir ? '/' : ''}</span>
				</div>
			{/each}
			{#if entries.length > 1}
				<div class="drag-bundle__count">{entries.length}</div>
			{/if}
			{#if copy}
				<div class="drag-bundle__mode">Copy</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.drag-bundle {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 80;
		pointer-events: none;
		will-change: transform;
	}

	.drag-bundle__body {
		position: relative;
		min-width: 210px;
		max-width: 320px;
		border-radius: 18px;
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		color: var(--text);
		box-shadow:
			0 18px 40px rgba(0, 0, 0, 0.42),
			inset 0 0 0 1px color-mix(in srgb, var(--accent) 42%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(18px);
	}

	.drag-bundle__row {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		opacity: calc(1 - var(--row-index) * 0.18);
	}

	.drag-bundle__row + .drag-bundle__row {
		border-top: 1px solid var(--hairline);
	}

	.drag-bundle__row span {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 13px;
	}

	.drag-bundle__count,
	.drag-bundle__mode {
		position: absolute;
		display: grid;
		place-items: center;
		border-radius: 999px;
		background: var(--accent);
		color: #161510;
		font-size: 12px;
		font-weight: 700;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
	}

	.drag-bundle__count {
		right: -8px;
		top: -8px;
		min-width: 24px;
		height: 24px;
		padding: 0 7px;
	}

	.drag-bundle__mode {
		right: 8px;
		bottom: -11px;
		height: 22px;
		padding: 0 9px;
	}
</style>
