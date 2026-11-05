<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { bytes, tooltip } from '@luft/ui';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import EntryIcon from '#lib/components/pane/EntryIcon.svelte';
	import { entryContext } from '#lib/file-manager/view/entry-props.js';
	import { thumbnailOf } from '#lib/file-manager/listing/thumbnails.js';
	import { fileKind, kindLabel } from '#lib/utils/kinds.js';
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
				<EntryIcon kind={fileKind(entry)} size={28} {...thumbnailOf(entry)} />
				<div class="min-w-0 flex-1">
					<p class="truncate text-[14px] font-medium text-[var(--text)]">{entry.name}</p>
					<p class="truncate text-[12px] text-[var(--text-muted)]">
						{kindLabel(entry)}{entry.isDir ? '' : ` · ${bytes(entry.size)}`} · {position} of {count}
					</p>
				</div>
				<button class="button" type="button" onclick={() => manager.openEntry(entry)}>Open</button>
				<button class="icon-button" type="button" aria-label="Close" onclick={close} {@attach tooltip('Close')}>
					<X size={17} />
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

<style>
	.quicklook-backdrop {
		position: fixed;
		inset: 0;
		z-index: 70;
		display: grid;
		place-items: center;
		background: rgba(0, 0, 0, 0.42);
	}

	.quicklook {
		display: flex;
		height: min(780px, calc(100dvh - 72px));
		width: min(1120px, calc(100vw - 96px));
		flex-direction: column;
		overflow: hidden;
		border-radius: 20px;
		background: var(--raised);
		box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
	}

	.quicklook-header {
		display: flex;
		min-height: 60px;
		flex: none;
		align-items: center;
		gap: 12px;
		padding: 0 12px 0 18px;
		box-shadow: 0 1px 0 var(--hairline);
	}

	.quicklook-body {
		position: relative;
		display: grid;
		min-height: 0;
		flex: 1;
		background: var(--content);
	}

	.quicklook-content {
		display: grid;
		min-height: 0;
		min-width: 0;
		grid-area: 1 / 1;
		place-items: center;
		overflow: hidden;
	}
</style>
