<script lang="ts">
	import { MultiChoice, Row, Segmented, Select, Slider, Switch } from '@luft/ui';
	import type { Extension, ExtensionSetting } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import ColorSetting from './ColorSetting.svelte';
	import { extensions } from './extensions.svelte';
	import ImageChoice from './ImageChoice.svelte';

	const SEGMENTS = 3;

	let { extension, setting }: { extension: Extension; setting: ExtensionSetting } = $props();

	const set = (value: boolean | number | string | string[]) => extensions.set(extension, setting, value);
	let format = $derived(
		setting.unit === 'percent' ? (value: number) => percent((value - (setting.min ?? 0)) / ((setting.max ?? 1) - (setting.min ?? 0))) : undefined
	);
	let pictures = $derived(
		setting.images.length === setting.options.length ? setting.options.map((option, index) => ({ ...option, image: setting.images[index] })) : []
	);
</script>

<Row title={setting.label} description={setting.description || undefined}>
	{#if setting.kind === 'switch'}
		<Switch label={setting.label} checked={setting.value === true} onchange={set} />
	{:else if setting.kind === 'choices' && Array.isArray(setting.value)}
		<MultiChoice label={setting.label} options={setting.options} value={setting.value} least={setting.min ?? 0} onchange={set} />
	{:else if setting.kind === 'choice' && !pictures.length && setting.options.length <= SEGMENTS}
		<Segmented label={setting.label} options={setting.options} value={String(setting.value)} onchange={set} />
	{:else if setting.kind === 'choice' && !pictures.length}
		<Select label={setting.label} options={setting.options} value={String(setting.value)} onchange={set} />
	{:else if setting.kind === 'color'}
		<ColorSetting {setting} value={String(setting.value)} onchange={set} />
	{/if}
	{#snippet below()}
		{#if setting.kind === 'slider'}
			<Slider
				label={setting.label}
				min={setting.min ?? 0}
				max={setting.max ?? 1}
				step={setting.step ?? 0.01}
				value={Number(setting.value)}
				{format}
				onchange={set}
			/>
		{:else if pictures.length}
			<ImageChoice label={setting.label} options={pictures} value={String(setting.value)} onchange={set} />
		{/if}
	{/snippet}
</Row>
