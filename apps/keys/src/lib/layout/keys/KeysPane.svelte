<script lang="ts">
	import { Segmented } from '@luft/ui';
	import { GEOMETRIES } from '$lib/keyboard/geometry';
	import Keyboard from '$lib/keyboard/Keyboard.svelte';
	import { app } from '$lib/state/app.svelte';
	import type { LayoutEditor } from '../editor.svelte';
	import Issues from '../Issues.svelte';
	import KeyInspector from './KeyInspector.svelte';
	import TryLayout from './TryLayout.svelte';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	const ALL = -1;

	let inspector = $state<KeyInspector>();
	let keyboard = $state<Keyboard>();

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
	let placing = $derived(editor.dead(editor.placing));

	$effect(() => {
		if (!app.creating) keyboard?.focus();
	});

	function chooseLayer(layer: number) {
		editor.layer = layer === ALL ? null : layer;
		if (layer !== ALL) editor.level = layer;
	}
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="w-[500px] max-w-full">
			<Segmented label="Level shown on the keys" options={layers} value={editor.layer ?? ALL} onchange={chooseLayer} />
		</div>
		<div class="w-[200px] flex-none">
			<Segmented label="Keyboard shape" options={GEOMETRIES} value={editor.geometry} onchange={(geometry) => editor.setGeometry(geometry)} />
		</div>
	</div>
	{#if placing}
		<div class="flex items-center justify-between gap-3 px-1.5 text-[13px] text-[var(--text-soft)]">
			<span>Pick a key for {placing.name}, then the level it goes on below.</span>
			<button type="button" class="plain-button" onclick={() => (editor.placing = null)}>Cancel</button>
		</div>
	{:else}
		<p class="px-1.5 text-[13px] text-[var(--text-muted)]">Pick a key, or press it while the keyboard is focused.</p>
	{/if}
	<Keyboard bind:this={keyboard} board={editor} onpicked={() => inspector?.focus()} />
	<KeyInspector bind:this={inspector} {editor} onescape={() => keyboard?.focus()} />
</section>
<section class="flex flex-col gap-2">
	<h2 class="px-1.5 text-[14px] font-semibold text-[var(--text-soft)]">Try it</h2>
	<TryLayout {editor} />
</section>
<Issues {editor} />
