<script lang="ts">
	import { menu as sabineMenu, spellcheck, type MenuContext, type MenuRole } from '@lantharos/sabine';
	import BookPlus from '@luft/symbols/icons/book-plus';
	import ClipboardPaste from '@luft/symbols/icons/clipboard-paste';
	import Copy from '@luft/symbols/icons/copy';
	import Redo2 from '@luft/symbols/icons/redo-2';
	import Scissors from '@luft/symbols/icons/scissors';
	import SquareDashedText from '@luft/symbols/icons/square-dashed-text';
	import Undo2 from '@luft/symbols/icons/undo-2';
	import { t } from '@luft/i18n';
	import ContextMenu from './ContextMenu.svelte';
	import { editorSelectsAll, rememberFocus } from './editing';
	import MenuItem from './MenuItem.svelte';
	import MenuSeparator from './MenuSeparator.svelte';

	let shown = $state<{ context: MenuContext; restore: () => void } | null>(null);

	$effect(() =>
		sabineMenu.onContext((context) => {
			shown = context.guest === null && (context.editable || context.canCopy) ? { context, restore: rememberFocus() } : null;
		})
	);

	function choose(action: () => unknown) {
		shown?.restore();
		shown = null;
		void action();
	}

	const run = (role: MenuRole) => choose(() => sabineMenu.run(role));
	const selectAll = () => choose(() => editorSelectsAll() || sabineMenu.run('selectAll'));
</script>

{#if shown}
	{@const context = shown.context}
	<ContextMenu at={context} onclose={() => (shown = null)}>
		{#if context.misspelled}
			{@const misspelled = context.misspelled}
			{#each context.suggestions as word, index (index)}
				<MenuItem onclick={() => choose(() => spellcheck.replace(word))}>
					<span class="suggestion">{word}</span>
				</MenuItem>
			{/each}
			<MenuItem onclick={() => choose(() => spellcheck.addWord(misspelled))}>
				<BookPlus size={16} />
				<span>{t('ui-edit-add-to-dictionary')}</span>
			</MenuItem>
			<MenuSeparator />
		{/if}
		{#if context.editable}
			{#if context.canUndo || context.canRedo}
				<MenuItem disabled={!context.canUndo} onclick={() => run('undo')}>
					<Undo2 size={16} />
					<span>{t('ui-edit-undo')}</span>
				</MenuItem>
				<MenuItem disabled={!context.canRedo} onclick={() => run('redo')}>
					<Redo2 size={16} />
					<span>{t('ui-edit-redo')}</span>
				</MenuItem>
				<MenuSeparator />
			{/if}
			<MenuItem disabled={!context.canCut} onclick={() => run('cut')}>
				<Scissors size={16} />
				<span>{t('ui-edit-cut')}</span>
			</MenuItem>
			<MenuItem disabled={!context.canCopy} onclick={() => run('copy')}>
				<Copy size={16} />
				<span>{t('ui-edit-copy')}</span>
			</MenuItem>
			<MenuItem disabled={!context.canPaste} onclick={() => run('paste')}>
				<ClipboardPaste size={16} />
				<span>{t('ui-edit-paste')}</span>
			</MenuItem>
			<MenuSeparator />
			<MenuItem disabled={!context.canSelectAll} onclick={selectAll}>
				<SquareDashedText size={16} />
				<span>{t('ui-edit-select-all')}</span>
			</MenuItem>
		{:else}
			<MenuItem onclick={() => run('copy')}>
				<Copy size={16} />
				<span>{t('ui-edit-copy')}</span>
			</MenuItem>
		{/if}
	</ContextMenu>
{/if}

<style>
	.suggestion {
		padding-inline-start: 26px;
		font-weight: 500;
		color: var(--text);
	}
</style>
