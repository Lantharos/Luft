<script lang="ts">
	import { tooltip } from '@luft/ui';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/Icon.svelte';
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import { entryContext } from '$lib/file-manager/view/entry-props';
	import { thumbnailOf } from '$lib/file-manager/listing/thumbnails';
	import { entryIcon } from '$lib/utils/file-kinds';
	import { formatBytes } from '$lib/utils/format';
	import { kindLabel } from '$lib/utils/kinds';
	import FilePreview from './FilePreview.svelte';

	const { manager, view } = entryContext();

	let entry = $derived(view.quickLook ? view.focused : null);
	let position = $derived(entry ? (view.indexByPath.get(entry.path) ?? 0) + 1 : 0);
	let count = $derived(manager.displayEntries.length);

	function pop(_node: Element) {
		return { duration: 180, easing: cubicOut, css: (t: number) => `opacity: ${t}; scale: ${0.97 + t * 0.03}` };
	}

	function close() {
		view.quickLook = false;
	}
</script>

{#if entry}
	<div
		class="quicklook-backdrop"
		role="presentation"
		transition:fade={{ duration: 160 }}
		onpointerdown={(event) => event.target === event.currentTarget && close()}
	>
		<div class="quicklook" role="dialog" aria-label={`Preview of ${entry.name}`} in:pop out:fade={{ duration: 120 }}>
			<header class="quicklook-header">
				<EntryIcon name={entryIcon(entry)} size={28} {...thumbnailOf(entry)} />
				<div class="min-w-0 flex-1">
					<p class="truncate text-[14px] font-medium text-[var(--text)]">{entry.name}</p>
					<p class="truncate text-[12px] text-[var(--text-muted)]">
						{kindLabel(entry)}{entry.is_dir ? '' : ` · ${formatBytes(entry.size)}`} · {position} of {count}
					</p>
				</div>
				<button class="button" type="button" onclick={() => manager.openEntry(entry)}>Open</button>
				<button class="icon-button" type="button" aria-label="Close" onclick={close} {@attach tooltip('Close')}>
					<Icon name="x" size={17} />
				</button>
			</header>
			<div class="quicklook-body">
				{#key entry.path}
					<div class="quicklook-content" in:fade={{ duration: 140 }}>
						<FilePreview {entry} full />
					</div>
				{/key}
			</div>
		</div>
	</div>
{/if}
