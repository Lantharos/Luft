<script lang="ts">
	import { SearchField, VirtualScroller } from '@luft/ui';
	import SubPage from '$lib/components/SubPage.svelte';
	import { fontFamilies, openFont, removeFont, type FontFamily } from './api';
	import FontRow from './FontRow.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const ROW_HEIGHT = 60;

	let families = $state.raw<FontFamily[] | null>(null);
	let search = $state('');
	let problem = $state('');

	let shown = $derived.by(() => {
		const needle = search.trim().toLowerCase();
		return needle ? (families ?? []).filter((family) => family.name.toLowerCase().includes(needle)) : (families ?? []);
	});

	async function load() {
		families = await fontFamilies();
	}

	async function attempt(action: () => Promise<void>) {
		problem = '';
		try {
			await action();
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
		}
	}

	function remove(family: FontFamily) {
		void attempt(async () => {
			await removeFont(family.name);
			await load();
		});
	}

	void load();
</script>

<svelte:window onfocus={load} />

<SubPage title="Fonts" back="Appearance" {onclose}>
	<SearchField bind:value={search} label="Search fonts" />
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
						<FontRow {family} divided={index > 0} onopen={() => attempt(() => openFont(family.file))} onremove={() => remove(family)} />
					{/snippet}
				</VirtualScroller>
			{:else}
				<p class="px-4 py-3.5 text-[14px] text-[var(--text-muted)]">No font is called that</p>
			{/if}
		</div>
	{/if}
</SubPage>
