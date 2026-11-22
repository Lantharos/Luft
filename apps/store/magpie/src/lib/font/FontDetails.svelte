<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { Item } from '#lib/bindings.js';
	import { openUri } from '#lib/bridge/index.js';
	import { count } from './characters';
	import { fontState } from './state.svelte';

	let { item }: { item: Item } = $props();

	let face = $derived(fontState.face);
	let rows = $derived.by(() => {
		if (!face) return [];
		const rows: [string, string][] = [];
		const add = (label: string, value: string | null | undefined) => value && rows.push([label, value]);
		add(t('magpie-font-family'), face.family);
		add(t('magpie-font-style'), face.style);
		add(t('magpie-font-weight'), face.axes.find((axis) => axis.tag === 'wght') ? t('magpie-font-variable') : String(Math.round(face.weight)));
		add(t('magpie-font-version'), face.version?.replace(/^Version\s+/i, ''));
		add(t('magpie-font-designer'), face.designer);
		add(t('magpie-font-made-by'), face.manufacturer);
		add(t('magpie-font-characters'), t('magpie-font-character-count', { characters: count(face.characters), glyphs: face.glyphs }));
		add(t('magpie-font-format'), fontState.file?.format);
		add(t('magpie-font-file'), t('magpie-font-file-value', { name: item.name, size: bytes(item.size) }));
		add(t('magpie-font-copyright'), face.copyright);
		add(t('magpie-font-license'), face.license);
		return rows;
	});
</script>

<div class="min-h-0 flex-1 overflow-y-auto">
	<dl class="mx-auto grid max-w-[760px] grid-cols-[minmax(110px,160px)_1fr] gap-x-8 gap-y-4 px-8 pt-4 pb-12">
		{#each rows as [label, value] (label)}
			<dt class="text-[13px] text-[var(--text-muted)]">{label}</dt>
			<dd class="text-[13px] leading-relaxed break-words whitespace-pre-line text-[var(--text)]">{value}</dd>
		{/each}
		{#if face?.licenseUrl}
			{@const url = face.licenseUrl}
			<dt></dt>
			<dd><button type="button" class="plain-button -ml-3" onclick={() => openUri(url)}>{t('magpie-font-read-license')}</button></dd>
		{/if}
	</dl>
</div>
