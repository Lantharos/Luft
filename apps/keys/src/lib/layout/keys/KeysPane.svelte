<script lang="ts">
	import { tick } from 'svelte';
	import Keyboard from '#lib/keyboard/Keyboard.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import type { LayoutEditor } from '../editor.svelte';
	import KeyInspector from './KeyInspector.svelte';
	import TryLayout from './TryLayout.svelte';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let levels = $state<KeyInspector>();
	let keyboard = $state<Keyboard>();
	let area = $state<HTMLElement>();

	let placing = $derived(editor.dead(editor.placing));

	$effect(() => {
		if (!app.creating) keyboard?.focus();
	});

	async function picked() {
		await tick();
		levels?.focus();
	}

	function close() {
		editor.inspecting = false;
		keyboard?.focus();
	}

	function outside(event: PointerEvent) {
		if (editor.inspecting && event.target instanceof Node && !area?.contains(event.target)) editor.inspecting = false;
	}
</script>

<svelte:window onpointerdown={outside} />

{#snippet panel()}
	<KeyInspector bind:this={levels} {editor} onescape={close} />
{/snippet}

<section bind:this={area} class="flex flex-col gap-3">
	{#if placing}
		<div class="flex h-8 items-center gap-3 px-1.5 text-[13px] text-[var(--text-soft)]">
			<span class="min-w-0 flex-1 truncate">Pick a key for {placing.name}</span>
			<button type="button" class="plain-button" onclick={() => (editor.placing = null)}>Cancel</button>
		</div>
	{/if}
	<Keyboard
		bind:this={keyboard}
		board={editor}
		inspector={editor.inspecting ? panel : undefined}
		onpicked={() => void picked()}
		onescape={editor.inspecting ? close : undefined}
	/>
</section>
<TryLayout {editor} />
