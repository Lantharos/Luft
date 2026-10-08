<script lang="ts">
	import { bytes, plural } from '@luft/ui';
	import type { Item } from '#lib/bridge/api.js';
	import * as api from '#lib/bridge/api.js';
	import { count } from './characters';
	import { fontState } from './state.svelte';

	let { item }: { item: Item } = $props();

	let face = $derived(fontState.face);
	let rows = $derived.by(() => {
		if (!face) return [];
		const rows: [string, string][] = [];
		const add = (label: string, value: string | null | undefined) => value && rows.push([label, value]);
		add('Family', face.family);
		add('Style', face.style);
		add('Weight', face.axes.find((axis) => axis.tag === 'wght') ? 'Variable' : String(Math.round(face.weight)));
		add('Version', face.version?.replace(/^Version\s+/i, ''));
		add('Designer', face.designer);
		add('Made by', face.manufacturer);
		add('Characters', `${plural(count(face.characters), 'character', 'characters')}, ${plural(face.glyphs, 'glyph', 'glyphs')}`);
		add('Format', fontState.file?.format);
		add('File', `${item.name}, ${bytes(item.size)}`);
		add('Copyright', face.copyright);
		add('License', face.license);
		return rows;
	});
</script>

<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
	<dl class="mx-auto grid max-w-[760px] grid-cols-[minmax(110px,160px)_1fr] gap-x-8 gap-y-4 px-8 pt-4 pb-12">
		{#each rows as [label, value] (label)}
			<dt class="text-[13px] text-[var(--text-muted)]">{label}</dt>
			<dd class="text-[13px] leading-relaxed break-words whitespace-pre-line text-[var(--text)]">{value}</dd>
		{/each}
		{#if face?.licenseUrl}
			{@const url = face.licenseUrl}
			<dt></dt>
			<dd><button type="button" class="plain-button -ml-3" onclick={() => api.openUri(url)}>Read the license</button></dd>
		{/if}
	</dl>
</div>
