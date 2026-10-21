<script lang="ts">
	import { basename, bytes, dateTime, parent, relativeDay, tooltip } from '@luft/ui';
	import File from '@lucide/svelte/icons/file';
	import Folder from '@lucide/svelte/icons/folder';
	import type { ConflictItem } from '#lib/features/types.js';

	interface Props {
		heading: string;
		item: ConflictItem;
		newer: boolean;
		larger: boolean;
	}

	let { heading, item, newer, larger }: Props = $props();

	let Icon = $derived(item.isDir ? Folder : File);
</script>

<div class="flex min-w-0 flex-1 flex-col gap-3 rounded-[18px] bg-[var(--surface)] p-4">
	<span class="text-[12px] text-[var(--text-muted)]">{heading}</span>
	<div class="flex min-w-0 items-center gap-3">
		<span class="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--control)] text-[var(--text-soft)]">
			<Icon size={19} />
		</span>
		<div class="min-w-0">
			<div class="truncate text-[14px] font-medium" {@attach tooltip(item.name)}>{item.name}</div>
			<div class="truncate text-[12px] text-[var(--text-muted)]" {@attach tooltip(parent(item.path))}>
				In {basename(parent(item.path)) || '/'}
			</div>
		</div>
	</div>
	<dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13px]">
		<dt class="text-[var(--text-muted)]">Size</dt>
		<dd class={['truncate text-right', larger ? 'text-[var(--text)]' : 'text-[var(--text-soft)]']}>{bytes(item.size)}</dd>
		<dt class="text-[var(--text-muted)]">Modified</dt>
		<dd class={['truncate text-right', newer ? 'text-[var(--accent)]' : 'text-[var(--text-soft)]']} {@attach tooltip(item.modified ? dateTime(item.modified) : '')}>
			{item.modified ? relativeDay(item.modified) : 'Unknown'}
		</dd>
	</dl>
</div>
