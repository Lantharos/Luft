<script lang="ts">
	import type { LayoutEditor } from './editor.svelte';
	import { caps, CODES, HEIGHT, WIDTH, type Cap } from './geometry';
	import KeyCap from './KeyCap.svelte';

	interface Props {
		editor: LayoutEditor;
		onpicked?: () => void;
	}

	let { editor, onpicked }: Props = $props();

	let board = $state<HTMLDivElement>();
	let shown = $derived(caps(editor.geometry));
	let altGr = $derived(editor.usesThirdLevel);

	export function focus() {
		board?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
	}

	function place(cap: Cap) {
		const height = cap.enter ? 2 : 1;
		return `left:${(cap.x / WIDTH) * 100}%;top:${(cap.y / HEIGHT) * 100}%;width:${(cap.width / WIDTH) * 100}%;height:${(height / HEIGHT) * 100}%`;
	}

	function label(cap: Cap) {
		return cap.name === 'RALT' && altGr ? 'AltGr' : cap.label;
	}

	function keydown(event: KeyboardEvent) {
		const name = CODES[event.code];
		if (!name || event.ctrlKey || event.metaKey || !shown.some((cap) => cap.name === name && !cap.label)) return;
		event.preventDefault();
		editor.select(name);
		onpicked?.();
	}
</script>

<div bind:this={board} class="board" role="group" aria-label="Keyboard">
	{#each shown as cap (cap.name)}
		<div class="slot" class:enter={cap.enter} style={place(cap)}>
			{#if cap.label}
				<div class="modifier" class:pressed={editor.pressed.has(cap.name)}>{label(cap)}</div>
			{:else}
				<KeyCap
					levels={editor.levels(cap.name)}
					selected={editor.selected === cap.name}
					pressed={editor.pressed.has(cap.name)}
					onselect={() => editor.select(cap.name)}
					onkeydown={keydown}
				/>
			{/if}
		</div>
	{/each}
</div>

<style>
	.board {
		position: relative;
		width: 100%;
		aspect-ratio: 15 / 5.1;
		container-type: inline-size;
	}

	.slot {
		position: absolute;
		padding: 0.28cqw;
	}

	.modifier {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: flex-end;
		border-radius: 0.9cqw;
		background: color-mix(in oklab, var(--control) 55%, transparent);
		padding: 0.7cqw 0.9cqw;
		overflow: hidden;
		white-space: nowrap;
		font-size: 1.05cqw;
		color: var(--text-muted);
		transition: background-color 140ms var(--ease);
	}

	.modifier.pressed {
		background: var(--accent-soft);
		color: var(--text);
	}

	.enter .modifier {
		clip-path: polygon(0 0, 100% 0, 100% 100%, 16.7% 100%, 16.7% 50%, 0 50%);
		align-items: flex-start;
		padding-left: 1.6cqw;
	}
</style>
