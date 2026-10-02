<script lang="ts">
	import { VirtualScroller } from '@luft/ui';
	import { chrome } from '$lib/app/chrome.svelte';
	import { codepoints, hex } from './characters';
	import { fontState } from './state.svelte';

	const LAYOUT = { itemHeight: 84, minItemWidth: 72, gap: 6, padding: { top: 4, right: 24, bottom: 32, left: 24 } };

	let list = $derived(Array.from(codepoints(fontState.face?.characters ?? [])));

	async function copy(codepoint: number) {
		const character = String.fromCodePoint(codepoint);
		await navigator.clipboard.writeText(character);
		chrome.notify(`Copied ${character}`);
	}
</script>

<VirtualScroller class="soft-scroll min-h-0 flex-1" items={list} key={(codepoint) => String(codepoint)} layout={LAYOUT}>
	{#snippet children(codepoint)}
		<button type="button" class="glyph" title="Copy {hex(codepoint)}" onclick={() => copy(codepoint)}>
			<span class="character" style:font-family="'{fontState.family}'" style:font-variation-settings={fontState.variation}>{String.fromCodePoint(codepoint)}</span>
			<span class="code">{hex(codepoint)}</span>
		</button>
	{/snippet}
</VirtualScroller>

<style>
	.glyph {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border-radius: 12px;
		background: var(--surface-hover);
		transition: transform 160ms var(--ease), background-color 160ms var(--ease);
	}

	.glyph:hover {
		background: color-mix(in oklab, var(--ink) 14%, transparent);
	}

	.glyph:active {
		transform: scale(0.96);
	}

	.character {
		font-size: 30px;
		line-height: 1;
		color: var(--text);
	}

	.code {
		font-size: 11px;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
