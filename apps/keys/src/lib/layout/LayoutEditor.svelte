<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Segmented } from '@luft/ui';
	import Page from '$lib/shell/Page.svelte';
	import SourceActions from '$lib/shell/SourceActions.svelte';
	import { app } from '$lib/state/app.svelte';
	import { toast } from '$lib/state/toast.svelte';
	import { deleteLayout, exportLayout, openLayout, systemLayouts, useLayout } from './api';
	import { LayoutEditor } from './editor.svelte';
	import KeyDetails from './KeyDetails.svelte';
	import Keyboard from './Keyboard.svelte';
	import LayoutDetails from './LayoutDetails.svelte';
	import TryLayout from './TryLayout.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	const GEOMETRIES = [
		{ value: 'ansi' as const, label: 'ANSI' },
		{ value: 'iso' as const, label: 'ISO' },
		{ value: 'jis' as const, label: 'JIS' }
	];

	let editor = $state<LayoutEditor | null>(null);
	let baseName = $state('');
	let details = $state<KeyDetails>();
	let keyboard = $state<Keyboard>();

	$effect(() => {
		if (editor && !app.creating) keyboard?.focus();
	});

	onMount(() => {
		openLayout(id)
			.then(async (layout) => {
				editor = new LayoutEditor(layout, () => void app.refresh());
				const base = layout.base?.replace(/\((.*)\)$/, '+$1');
				baseName = (base && (await systemLayouts()).find((entry) => entry.id === base)?.name) || '';
			})
			.catch((error) => {
				toast.failed(error);
				app.select(app.first());
			});
	});

	onDestroy(() => void editor?.save());

	async function remove() {
		editor?.discard();
		await deleteLayout(id);
		await app.removed();
	}
</script>

{#if editor}
	{@const current = editor}
	<Page title={current.layout.name}>
		{#snippet actions()}
			<SourceActions
				selection={{ kind: 'layout', id }}
				what="layout"
				onuse={() => useLayout(id)}
				exports={[
					{ label: 'Export layout file', run: () => exportLayout(id, 'symbols') },
					{ label: 'Export as a complete keymap', run: () => exportLayout(id, 'keymap') }
				]}
				onremove={remove}
			/>
		{/snippet}
		<section class="flex flex-col gap-4">
			<div class="flex items-center justify-between gap-4">
				<p class="text-[13px] text-[var(--text-muted)]">Pick a key, or press it while the keyboard is focused.</p>
				<div class="w-[200px]">
					<Segmented label="Keyboard shape" options={GEOMETRIES} value={current.geometry} onchange={(geometry) => current.setGeometry(geometry)} />
				</div>
			</div>
			<Keyboard bind:this={keyboard} editor={current} onpicked={() => details?.focus()} />
			<KeyDetails bind:this={details} editor={current} onescape={() => keyboard?.focus()} />
		</section>
		<section class="flex flex-col gap-2">
			<h2 class="px-1.5 text-[14px] font-semibold text-[var(--text-soft)]">Try it</h2>
			<TryLayout editor={current} />
		</section>
		<LayoutDetails editor={current} {baseName} />
	</Page>
{/if}
