<script lang="ts">
	import { Segmented } from '@luft/ui';
	import type { LayoutEditor } from '../editor.svelte';
	import IssuesMenu from './IssuesMenu.svelte';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	const ALL = -1;

	let layers = $derived([
		{ value: ALL, label: 'All' },
		{ value: 0, label: 'Alone' },
		{ value: 1, label: 'Shift' },
		...(editor.usesThirdLevel
			? [
					{ value: 2, label: 'AltGr' },
					{ value: 3, label: 'Shift AltGr' }
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
	<Segmented label="Level shown on the keys" options={layers} value={editor.layer ?? ALL} onchange={choose}>
		{#snippet item(option)}
			{option.label}
		{/snippet}
	</Segmented>
</div>
