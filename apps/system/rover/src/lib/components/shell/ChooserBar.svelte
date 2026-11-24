<script lang="ts">
	import File from '@luft/symbols/icons/file';
	import FolderOpen from '@luft/symbols/icons/folder-open';
	import Save from '@luft/symbols/icons/save';
	import { tick } from 'svelte';
	import { t } from '@luft/i18n';
	import { Select, tooltip } from '@luft/ui';
	import ReplaceDialog from '#lib/components/dialogs/replace/ReplaceDialog.svelte';
	import type { ChooserState } from '#lib/file-manager/chooser.svelte.js';

	interface Props {
		chooser: ChooserState;
		selectedCount: number;
	}

	let { chooser, selectedCount }: Props = $props();

	const BUTTON =
		'inline-flex h-10 min-w-[96px] select-none items-center justify-center rounded-full px-5 text-[13px] font-medium leading-none transition-[background-color,color,opacity,box-shadow,filter] disabled:opacity-40';
	const SECONDARY =
		'bg-[var(--control)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] hover:bg-[var(--control-hover)] focus-visible:bg-[var(--control-hover)]';
	const PRIMARY =
		'bg-[var(--text)] text-[var(--text-inverse)] shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] hover:brightness-95 focus-visible:brightness-95';

	let config = $derived(chooser.config);
	let selectionText = $derived.by(() => {
		if (config.mode === 'save') return t('rover-chooser-save-as');
		if (config.mode === 'save_files') return t('rover-chooser-files', { count: config.files.length });
		if (selectedCount > 0) return t('rover-chooser-selected', { count: selectedCount });
		return config.directory ? t('rover-chooser-pick-folder') : t('rover-chooser-pick-file');
	});
	let acceptLabel = $derived(
		config.acceptLabel.trim() || (config.mode === 'save' ? t('rover-chooser-save') : config.mode === 'save_files' ? t('rover-chooser-select') : t('rover-open'))
	);
	let Icon = $derived(config.mode === 'save' ? Save : config.directory || config.mode === 'save_files' ? FolderOpen : File);

	let nameField = $state<HTMLInputElement>();

	function focusName(input: HTMLInputElement) {
		input.focus();
		input.select();
	}

	async function keepEditing() {
		chooser.keep();
		await tick();
		if (nameField) focusName(nameField);
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

<div class="chooser-bar flex min-h-[68px] shrink-0 items-center justify-between gap-3 px-5 py-3">
	<div class="flex min-w-0 flex-1 items-center gap-3 text-[13px] text-[var(--text-muted)]">
		<div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--control)] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)]">
			<Icon size={18} />
		</div>
		<div class="min-w-0">
			<div class="truncate text-[14px] font-medium text-[var(--text)]">{config.title.trim() || selectionText}</div>
			<div class="truncate text-[12px] text-[var(--text-muted)]">{selectionText}</div>
		</div>
	</div>

	{#if chooser.filter !== null}
		<Select
			label={t('rover-chooser-filter')}
			options={config.filters.map((filter, index) => ({ value: index, label: filter.name }))}
			value={chooser.filter}
			onchange={(index) => (chooser.filter = index)}
		/>
	{/if}

	{#if config.mode === 'save'}
		<div class="flex w-[320px] min-w-0 items-center gap-2">
			<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{t('rover-chooser-name')}</span>
			<input
				bind:this={nameField}
				{@attach focusName}
				class="h-10 min-w-0 flex-1 rounded-full bg-[var(--control)] px-4 text-[13px] font-medium text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)] outline-none transition-[background-color,box-shadow] placeholder:font-normal placeholder:text-[var(--text-muted)] focus:bg-[var(--control-hover)] focus:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--ink)_20%,transparent)]"
				value={chooser.saveName}
				placeholder={t('rover-chooser-untitled')}
				aria-label={t('rover-chooser-file-name')}
				spellcheck="false"
				autocomplete="off"
				autocapitalize="off"
				oninput={(event) => (chooser.saveName = event.currentTarget.value)}
				onkeydown={handleNameKeydown}
			/>
		</div>
	{/if}

	<div class="flex shrink-0 items-center gap-2">
		<button class={[BUTTON, SECONDARY]} type="button" onclick={chooser.cancel}>{t('rover-cancel')}</button>

		<button
			class={[BUTTON, PRIMARY]}
			type="button"
			disabled={!chooser.canAccept}
			onclick={() => chooser.submit()}
			{@attach tooltip(chooser.cannotSave ? t('rover-chooser-no-save') : '')}
		>
			{acceptLabel}
		</button>
	</div>
</div>

{#if chooser.replacing}
	{@const { paths, clashes } = chooser.replacing}
	<ReplaceDialog {clashes} onreplace={() => chooser.replace(paths)} onclose={keepEditing} />
{/if}

<style>
	.chooser-bar {
		background: var(--content);
		box-shadow: inset 0 1px 0 var(--hairline);
	}
</style>
