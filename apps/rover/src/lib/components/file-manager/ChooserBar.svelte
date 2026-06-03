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
	const chooserButton =
		'inline-flex h-10 min-w-[96px] items-center justify-center rounded-full px-4 text-[13px] font-medium transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.96]';

	let selectionText = $derived.by(() => {
		if (config.mode === 'save') return 'Save as';
		if (config.mode === 'save_files') return `${config.files.length} ${config.files.length === 1 ? 'file' : 'files'}`;
		if (selectedCount > 0) return `${selectedCount} selected`;
		return config.directory ? 'Select a folder' : 'Select a file';
	});

	function handleNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && canAccept) {
			event.preventDefault();
			onAccept();
		}
	}
</script>

<div class="flex min-h-14 shrink-0 items-center justify-between gap-3 bg-[var(--content)] px-5 py-2 shadow-[0_-1px_0_var(--hairline)]">
	<div class="flex min-w-0 items-center gap-3 text-[13px] text-[var(--text-muted)]">
		<div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--control)] text-[var(--text-soft)]">
			<Icon name={config.directory || config.mode === 'save_files' ? 'folder-open' : 'file'} size={17} />
		</div>
		<div class="min-w-0">
			<div class="truncate text-[14px] text-[var(--text)]">{config.title || selectionText}</div>
			<div class="truncate text-[12px]">{selectionText}</div>
		</div>
	</div>

	{#if config.mode === 'save'}
		<input
			class="h-10 w-[260px] min-w-0 rounded-full bg-[var(--control)] px-4 text-[14px] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] outline-none transition-[background-color,box-shadow] duration-150 focus:bg-[var(--control-hover)] focus:shadow-[inset_0_0_0_1px_rgba(245,245,242,0.2)]"
			value={saveName}
			aria-label="File name"
			spellcheck="false"
			oninput={(event) => onSaveName(event.currentTarget.value)}
			onkeydown={handleNameKeydown}
		/>
	{/if}

	<div class="flex shrink-0 items-center gap-2">
		<button
			class={[
				chooserButton,
				'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'
			]}
			type="button"
			onclick={onCancel}
		>
			Cancel
		</button>
		<button
			class={[
				chooserButton,
				'bg-[var(--control)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] hover:bg-[var(--control-hover)] disabled:opacity-35'
			]}
			type="button"
			disabled={!canAccept}
			onclick={onAccept}
		>
			{config.accept_label || 'Select'}
		</button>
	</div>
</div>
