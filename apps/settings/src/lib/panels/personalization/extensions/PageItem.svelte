<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { Row, Segmented, Select, Slider, Switch, TextField } from '@luft/ui';
	import type { Extension, PageItem } from '#lib/bindings.js';
	import RowValue from '#lib/components/RowValue.svelte';
	import { percent } from '#lib/format.js';
	import { extensions, shown } from './extensions.svelte';
	import ImageChoice from './ImageChoice.svelte';
	import SettingRow from './SettingRow.svelte';
	import TaskbarPlace from './TaskbarPlace.svelte';

	const SEGMENTS = 3;

	let { extension, item }: { extension: Extension; item: PageItem } = $props();

	const act = (control: string, value?: boolean | number | string) => extensions.act(extension, control, value);
	let declared = $derived(item.type === 'setting' ? extension.settings.find((setting) => setting.key === item.key) : undefined);
	let typed = $state('');
	$effect(() => {
		if (item.type === 'entry') typed = item.value;
	});
</script>

{#if item.type === 'setting'}
	{#if declared && shown(extension, declared)}
		<SettingRow {extension} setting={declared} />
	{/if}
{:else if item.type === 'text'}
	<p class="px-2 py-1 text-[13.5px] leading-snug text-[var(--text-soft)]">{item.text}</p>
{:else if item.type === 'row'}
	{@const action = item.action}
	<Row title={item.title} description={item.description ?? undefined} onclick={action ? () => act(action) : undefined}>
		{#if item.value}<RowValue text={item.value} />{/if}
	</Row>
{:else if item.type === 'switch'}
	{@const action = item.action}
	<Row title={item.title} description={item.description ?? undefined}>
		<Switch label={item.title} checked={item.checked} onchange={(on) => act(action, on)} />
	</Row>
{:else if item.type === 'choice'}
	{@const action = item.action}
	{@const pictures = item.options.every((option) => option.image) ? item.options.map((option) => ({ ...option, image: option.image! })) : []}
	<Row title={item.title} description={item.description ?? undefined}>
		{#if !pictures.length && item.options.length <= SEGMENTS}
			<Segmented label={item.title} options={item.options} value={item.value} onchange={(value) => act(action, value)} />
		{:else if !pictures.length}
			<Select label={item.title} options={item.options} value={item.value} onchange={(value) => act(action, value)} />
		{/if}
		{#snippet below()}
			{#if pictures.length}
				<ImageChoice label={item.title} options={pictures} value={item.value} onchange={(value) => act(action, value)} />
			{/if}
		{/snippet}
	</Row>
{:else if item.type === 'slider'}
	{@const action = item.action}
	{@const span = item.max - item.min}
	<Row title={item.title} description={item.description ?? undefined}>
		{#snippet below()}
			<Slider
				label={item.title}
				min={item.min}
				max={item.max}
				step={item.step ?? span / 100}
				value={item.value}
				format={item.unit === 'percent' ? (value: number) => percent((value - item.min) / span) : undefined}
				onchange={(value) => act(action, value)}
			/>
		{/snippet}
	</Row>
{:else if item.type === 'button'}
	{@const action = item.action}
	<Row title={item.title} description={item.description ?? undefined}>
		<button type="button" class="button" class:danger={item.danger} onclick={() => act(action)}>{item.label}</button>
	</Row>
{:else if item.type === 'entry'}
	{@const action = item.action}
	<Row title={item.title} description={item.description ?? undefined}>
		{#snippet below()}
			<div role="presentation" onfocusout={() => typed !== item.value && act(action, typed)}>
				<TextField
					label={item.title}
					placeholder={item.placeholder ?? undefined}
					bind:value={typed}
					onkeydown={(event) => event.key === 'Enter' && act(action, typed)}
				/>
			</div>
		{/snippet}
	</Row>
{:else if item.type === 'preview'}
	<img class="preview" src={fileUrl(item.image)} alt={item.description} decoding="async" />
{:else if item.type === 'taskbar-place'}
	<TaskbarPlace element={item.element} />
{:else if item.type === 'list'}
	{#each item.items as row, index (index)}
		<Row title={row.title} description={row.description ?? undefined}>
			{#each row.actions as action, number (number)}
				<button type="button" class="button" class:danger={action.danger} onclick={() => act(action.action)}>{action.label}</button>
			{/each}
		</Row>
	{:else}
		{#if item.empty}<Row title={item.empty} />{/if}
	{/each}
{/if}

<style>
	.preview {
		display: block;
		width: calc(100% - 12px);
		margin: 6px;
		border-radius: 14px;
		object-fit: cover;
		max-height: 260px;
	}
</style>
