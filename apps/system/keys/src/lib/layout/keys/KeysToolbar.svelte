<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented } from '@luft/ui';
	import { levelShortNames } from '#lib/keyboard/names.js';
	import type { LayoutEditor } from '../editor.svelte';
	import IssuesMenu from './IssuesMenu.svelte';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	const ALL = -1;

	let layers = $derived([
		{ value: ALL, label: t('keys-layer-all') },
		{ value: 0, label: levelShortNames()[0] },
		{ value: 1, label: levelShortNames()[1] },
		...(editor.usesThirdLevel
			? [
					{ value: 2, label: levelShortNames()[2] },
					{ value: 3, label: levelShortNames()[3] }
				]
			: [])
	]);

	function choose(layer: number) {
		editor.layer = layer === ALL ? null : layer;
		if (layer !== ALL) editor.level = layer;
	}
</script>

<div class="flex items-center gap-2">
	<IssuesMenu {editor} />
	<Segmented label={t('keys-layer')} options={layers} value={editor.layer ?? ALL} onchange={choose}>
		{#snippet item(option)}
			{option.label}
		{/snippet}
	</Segmented>
</div>
