<script lang="ts">
	import { untrack } from 'svelte';
	import { Row, Section, Select, Slider } from '@luft/ui';
	import { plural } from '$lib/library/format';
	import { count, headline, sampleText } from './characters';
	import { fontState } from './state.svelte';
	import Variations from './Variations.svelte';

	const WATERFALL = [14, 20, 28, 40, 56];

	let face = $derived(fontState.face!);
	let faces = $derived(fontState.file?.faces ?? []);
	let size = $state(48);
	let text = $derived(sampleText(face.characters, face.sample));
	let style = $derived(`font-family: '${fontState.family}'; font-variation-settings: ${fontState.variation}`);

	function fill(node: HTMLDivElement) {
		node.textContent = untrack(() => text);
	}
</script>

<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
	<div class="mx-auto flex max-w-[860px] flex-col gap-7 px-8 pt-6 pb-12" class:invisible={!fontState.family}>
		<div class="flex flex-col gap-2">
			<p class="hero" {style}>{headline(face.characters, face.family)}</p>
			<p class="text-[13px] text-[var(--text-muted)]">
				{face.style} · {plural(count(face.characters), 'character', 'characters')}
			</p>
		</div>

		{#key face}
			<div
				class="sample"
				style="{style}; font-size: {size}px"
				contenteditable="plaintext-only"
				role="textbox"
				tabindex="0"
				aria-label="Sample text"
				spellcheck="false"
				oninput={(event) => (text = event.currentTarget.textContent ?? '')}
				{@attach fill}
			></div>
		{/key}

		<div class="flex flex-col gap-1.5">
			{#each WATERFALL as line (line)}
				<p class="truncate leading-snug" style="{style}; font-size: {line}px">{text}</p>
			{/each}
		</div>

		<Section>
			{#if faces.length > 1}
				<Row title="Face">
					<Select
						label="Face"
						options={faces.map((candidate, index) => ({ value: index, label: `${candidate.family} ${candidate.style}` }))}
						value={fontState.faceIndex}
						onchange={(index) => fontState.selectFace(index)}
					/>
				</Row>
			{/if}
			<Row title="Size">
				<span class="w-12 text-right tabular-nums">{size} px</span>
				{#snippet below()}
					<Slider label="Size" min={12} max={160} step={1} value={size} oninput={(value) => (size = value)} onchange={(value) => (size = value)} />
				{/snippet}
			</Row>
		</Section>

		{#if face.axes.length}
			<Variations {face} />
		{/if}
	</div>
</div>

<style>
	.hero {
		overflow-wrap: anywhere;
		font-size: 76px;
		line-height: 1.1;
		color: var(--text);
	}

	.sample {
		min-height: 1.4em;
		overflow-wrap: anywhere;
		border-radius: 18px;
		background: var(--surface);
		padding: 20px 24px;
		line-height: 1.25;
		color: var(--text);
		outline: none;
		transition: box-shadow 160ms var(--ease);
	}

	.sample:focus-visible {
		box-shadow: 0 0 0 2px var(--accent-line);
	}
</style>
