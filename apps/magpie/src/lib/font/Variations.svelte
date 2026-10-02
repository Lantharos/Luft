<script lang="ts">
	import { Row, Section, Select, Slider } from '@luft/ui';
	import type { FontFace } from '$lib/api';
	import { fontState } from './state.svelte';

	let { face }: { face: FontFace } = $props();

	let instance = $derived(
		face.instances.findIndex((candidate) => candidate.coordinates.every(([tag, value]) => fontState.coordinates[tag] === value))
	);
	let step = (min: number, max: number) => (max - min > 20 ? 1 : 0.1);
	let format = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
</script>

<Section>
	{#if face.instances.length}
		<Row title="Named style">
			<Select
				label="Named style"
				placeholder="Custom"
				options={face.instances.map((candidate, index) => ({ value: index, label: candidate.name }))}
				value={instance}
				onchange={(index) => fontState.applyInstance(face.instances[index])}
			/>
		</Row>
	{/if}
	{#each face.axes as axis (axis.tag)}
		<Row title={axis.name}>
			<span class="w-12 text-right tabular-nums">{format(fontState.coordinates[axis.tag] ?? axis.default)}</span>
			{#snippet below()}
				<Slider
					label={axis.name}
					min={axis.min}
					max={axis.max}
					step={step(axis.min, axis.max)}
					value={fontState.coordinates[axis.tag] ?? axis.default}
					{format}
					oninput={(value) => (fontState.coordinates[axis.tag] = value)}
					onchange={(value) => (fontState.coordinates[axis.tag] = value)}
				/>
			{/snippet}
		</Row>
	{/each}
</Section>
