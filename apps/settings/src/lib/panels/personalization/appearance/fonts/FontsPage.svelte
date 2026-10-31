<script lang="ts">
	import { t } from '@luft/i18n';
	import { errorText, SearchField, VirtualScroller } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { FontFamily } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { openFont } from './api';
	import FontRow from './FontRow.svelte';
	import { fontLibrary } from './library.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const ROW_HEIGHT = 60;

	let families = $derived(fontLibrary.families);
	let search = $state('');
	let problem = $state('');

	let shown = $derived.by(() => {
		const needle = search.trim().toLowerCase();
		return needle ? (families ?? []).filter((family) => family.name.toLowerCase().includes(needle)) : (families ?? []);
	});

	async function attempt(action: () => Promise<unknown>) {
		problem = '';
		try {
			await action();
		} catch (reason) {
			problem = errorText(reason);
		}
	}

	function remove(family: FontFamily) {
		void attempt(async () => {
			await commands.appearanceFontRemove({ family: family.name });
			await fontLibrary.load();
		});
	}

	void fontLibrary.load();
</script>

<svelte:window onfocus={() => fontLibrary.load()} />

<SubPage title={t('settings-fonts-all')} back={t('settings-appearance-text')} {onclose}>
	<SearchField bind:value={search} label={t('settings-fonts-search')} />
	{#if problem}
		<p class="-my-3 px-1.5 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#if families}
		<div class="row-group">
			{#if shown.length}
				<VirtualScroller
					class="soft-scroll scroll-fade h-[min(calc(100dvh-250px),calc(var(--rows)*60px))]"
					style="--rows: {shown.length}"
					items={shown}
					key={(family) => family.name}
					layout={{ itemHeight: ROW_HEIGHT }}
				>
					{#snippet children(family, index)}
						<FontRow
							{family}
							divided={index > 0}
							onopen={() => attempt(() => openFont(family.file))}
							onuse={(role) => attempt(() => fontLibrary.choose(role, family.name))}
							onremove={() => remove(family)}
						/>
					{/snippet}
				</VirtualScroller>
			{:else}
				<p class="px-4 py-3.5 text-[14px] text-[var(--text-muted)]">{t('settings-fonts-no-match')}</p>
			{/if}
		</div>
	{/if}
</SubPage>
