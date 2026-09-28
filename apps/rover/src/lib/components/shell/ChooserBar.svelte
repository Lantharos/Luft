<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { ChooserState } from '$lib/file-manager/chooser.svelte';
	import { plural } from '$lib/utils/format';

	interface Props {
		chooser: ChooserState;
		selectedCount: number;
	}

	let { chooser, selectedCount }: Props = $props();

	const BUTTON =
		'inline-flex h-10 min-w-[96px] select-none items-center justify-center rounded-full px-5 text-[13px] font-medium leading-none transition-[background-color,color,transform,opacity,box-shadow,filter] duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100';
	const SECONDARY =
		'bg-[var(--control)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] hover:bg-[var(--control-hover)] focus-visible:bg-[var(--control-hover)]';
	const PRIMARY =
		'bg-[var(--text)] text-[var(--text-inverse)] shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] hover:brightness-95 focus-visible:brightness-95';

	let config = $derived(chooser.config);
	let selectionText = $derived.by(() => {
		if (config.mode === 'save') return 'Save as';
		if (config.mode === 'save_files') return plural(config.files.length, 'file');
		if (selectedCount > 0) return `${selectedCount} selected`;
		return config.directory ? 'Select a folder' : 'Select a file';
	});
	let acceptLabel = $derived(config.accept_label.trim() || (config.mode === 'save' ? 'Save' : config.mode === 'save_files' ? 'Select' : 'Open'));
	let icon = $derived<'folder-open' | 'file' | 'save'>(
		config.mode === 'save' ? 'save' : config.directory || config.mode === 'save_files' ? 'folder-open' : 'file'
	);

	function focusName(input: HTMLInputElement) {
		input.focus();
		input.select();
	}

	function handleNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && chooser.canAccept) {
			event.preventDefault();
			event.stopPropagation();
			void chooser.submit();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			void chooser.cancel();
		}
	}
</script>

<div class="flex min-h-[68px] shrink-0 items-center justify-between gap-3 bg-[var(--content)] px-5 py-3 shadow-[0_-1px_0_var(--hairline)]">
	<div class="flex min-w-0 flex-1 items-center gap-3 text-[13px] text-[var(--text-muted)]">
		<div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--control)] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)]">
			<Icon name={icon} size={18} />
		</div>
		<div class="min-w-0">
			<div class="truncate text-[14px] font-medium text-[var(--text)]">{config.title.trim() || selectionText}</div>
			<div class="truncate text-[12px] text-[var(--text-muted)]">{selectionText}</div>
		</div>
	</div>

	{#if config.mode === 'save'}
		<div class="flex w-[320px] min-w-0 items-center gap-2">
			<span class="shrink-0 text-[12px] text-[var(--text-muted)]">Name</span>
			<input
				{@attach focusName}
				class="h-10 min-w-0 flex-1 rounded-full bg-[var(--control)] px-4 text-[13px] font-medium text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] outline-none transition-[background-color,box-shadow] duration-150 placeholder:font-normal placeholder:text-[var(--text-muted)] focus:bg-[var(--control-hover)] focus:shadow-[inset_0_0_0_1px_rgba(245,245,242,0.2)]"
				value={chooser.saveName}
				placeholder="Untitled"
				aria-label="File name"
				spellcheck="false"
				autocomplete="off"
				autocapitalize="off"
				oninput={(event) => (chooser.saveName = event.currentTarget.value)}
				onkeydown={handleNameKeydown}
			/>
		</div>
	{/if}

	<div class="flex shrink-0 items-center gap-2">
		<button class={[BUTTON, SECONDARY]} type="button" onclick={chooser.cancel}>Cancel</button>
		<button class={[BUTTON, PRIMARY]} type="button" disabled={!chooser.canAccept} onclick={() => chooser.submit()}>
			{acceptLabel}
		</button>
	</div>
</div>
