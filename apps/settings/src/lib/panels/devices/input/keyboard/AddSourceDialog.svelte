<script lang="ts">
	import { t } from '@luft/i18n';
	import { tick } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import { Dialog, SearchField } from '@luft/ui';
	import type { Source } from './sources';

	interface Props {
		sources: Source[];
		onadd: (source: Source) => void;
		onclose: () => void;
	}

	let { sources, onadd, onclose }: Props = $props();

	let query = $state('');
	let selected = $state.raw<Source | null>(null);
	let list = $state<HTMLDivElement>();

	let results = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		return sources.filter((source) => !needle || source.name.toLowerCase().includes(needle));
	});

	async function move(step: number) {
		const index = selected ? results.indexOf(selected) : -1;
		selected = results[Math.min(results.length - 1, Math.max(0, index + step))] ?? null;
		await tick();
		list?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') move(1);
		else if (event.key === 'ArrowUp') move(-1);
		else if (event.key === 'Enter' && selected) onadd(selected);
		else return;
		event.preventDefault();
	}
</script>

<Dialog title={t('settings-keyboard-add-source')} description={t('settings-keyboard-add-source-description')} {onclose}>
	<SearchField label={t('settings-keyboard-add-source-search')} bind:value={query} onkeydown={keydown} />
	<div bind:this={list} class="hidden-scroll scroll-fade -mx-2 flex h-[300px] flex-col gap-0.5 overflow-y-auto px-2" role="listbox" aria-label={t('settings-keyboard-sources')}>
		{#each results as source (`${source.type}:${source.id}`)}
			<button
				type="button"
				role="option"
				aria-selected={selected === source}
				class="option"
				onclick={() => (selected = source)}
				ondblclick={() => onadd(source)}
			>
				<span class="truncate">{source.name}</span>
				{#if selected === source}
					<Check size={16} class="shrink-0" />
				{:else if source.type === 'ibus'}
					<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{t('settings-keyboard-input-method')}</span>
				{/if}
			</button>
		{:else}
			<p class="px-2.5 py-2 text-[13px] text-[var(--text-muted)]">{t('settings-keyboard-add-source-no-match', { query: query.trim() })}</p>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-keyboard-cancel')}</button>
		<button type="button" class="button primary" disabled={!selected} onclick={() => selected && onadd(selected)}>{t('settings-keyboard-add')}</button>
	{/snippet}
</Dialog>

<style>
	.option {
		display: flex;
		min-height: 36px;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 10px;
		text-align: left;
		font-size: 13px;
		color: var(--text-soft);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.option:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.option[aria-selected='true'] {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
