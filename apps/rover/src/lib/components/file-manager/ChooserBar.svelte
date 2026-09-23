<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { ChooserConfig } from '$lib/types';

	interface Props {
		config: ChooserConfig;
		selectedCount: number;
		canAccept: boolean;
		saveName: string;
		onSaveName: (value: string) => void;
		onAccept: () => void;
		onCancel: () => void;
	}

	let { config, selectedCount, canAccept, saveName, onSaveName, onAccept, onCancel }: Props = $props();

	const buttonBase =
		'inline-flex h-10 min-w-[96px] select-none items-center justify-center rounded-full px-5 text-[13px] font-medium leading-none tracking-[-0.005em] transition-[background-color,color,transform,opacity,box-shadow] duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-40 disabled:active:scale-100';

	const secondaryButton =
		'bg-[var(--control)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] hover:bg-[var(--control-hover)] focus-visible:bg-[var(--control-hover)]';

	const primaryButton =
		'bg-[var(--accent)] text-[var(--text-inverse)] shadow-[0_8px_24px_rgba(243,243,239,0.18),inset_0_1px_0_rgba(255,255,255,0.32)] hover:brightness-95 focus-visible:brightness-95';

	let saveInput = $state<HTMLInputElement>();

	let selectionText = $derived.by(() => {
		if (config.mode === 'save') return 'Save as';
		if (config.mode === 'save_files') return `${config.files.length} ${config.files.length === 1 ? 'file' : 'files'}`;
		if (selectedCount > 0) return `${selectedCount} selected`;
		return config.directory ? 'Select a folder' : 'Select a file';
	});

	let acceptLabel = $derived(
		config.accept_label?.trim() ||
			(config.mode === 'save' ? 'Save' : config.mode === 'save_files' ? 'Select' : config.directory ? 'Open' : 'Open')
	);

	let chooserIcon = $derived<'folder-open' | 'file' | 'save'>(
		config.mode === 'save' ? 'save' : config.directory || config.mode === 'save_files' ? 'folder-open' : 'file'
	);

	let titleText = $derived(config.title?.trim() || selectionText);

	function handleNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && canAccept) {
			event.preventDefault();
			event.stopPropagation();
			onAccept();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			onCancel();
		}
	}

	$effect(() => {
		if (config.mode === 'save' && saveInput) {
			saveInput.focus();
			saveInput.select();
		}
	});
</script>

<div class="flex min-h-[68px] shrink-0 items-center justify-between gap-3 bg-[var(--content)] px-5 py-3 shadow-[0_-1px_0_var(--hairline)]">
	<div class="flex min-w-0 flex-1 items-center gap-3 text-[13px] text-[var(--text-muted)]">
		<div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--control)] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)]">
			<Icon name={chooserIcon} size={18} />
		</div>
		<div class="min-w-0">
			<div class="truncate text-[14px] font-medium text-[var(--text)]">{titleText}</div>
			<div class="truncate text-[12px] text-[var(--text-muted)]">{selectionText}</div>
		</div>
	</div>

	{#if config.mode === 'save'}
		<div class="flex w-[320px] min-w-0 items-center gap-2">
			<span class="shrink-0 text-[12px] text-[var(--text-muted)]">Name</span>
			<input
				bind:this={saveInput}
				class="h-10 min-w-0 flex-1 rounded-full bg-[var(--control)] px-4 text-[13px] font-medium text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] outline-none transition-[background-color,box-shadow] duration-150 placeholder:font-normal placeholder:text-[var(--text-muted)] focus:bg-[var(--control-hover)] focus:shadow-[inset_0_0_0_1px_rgba(245,245,242,0.2)]"
				value={saveName}
				placeholder="Untitled"
				aria-label="File name"
				spellcheck="false"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				oninput={(event) => onSaveName(event.currentTarget.value)}
				onkeydown={handleNameKeydown}
			/>
		</div>
	{/if}

	<div class="flex shrink-0 items-center gap-2">
		<button class={[buttonBase, secondaryButton]} type="button" onclick={onCancel}>Cancel</button>
		<button class={[buttonBase, primaryButton]} type="button" disabled={!canAccept} onclick={onAccept}>
			{acceptLabel}
		</button>
	</div>
</div>
