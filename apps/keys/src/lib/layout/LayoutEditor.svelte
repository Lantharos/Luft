<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Segmented } from '@luft/ui';
	import ShapeItems from '#lib/keyboard/ShapeItems.svelte';
	import Page from '#lib/shell/Page.svelte';
	import SourceActions from '#lib/shell/SourceActions.svelte';
	import UndoButtons from '#lib/shell/UndoButtons.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import { deleteLayout, exportLayout, openLayout, systemLayouts, useLayout } from './api';
	import DeadKeysPane from './dead/DeadKeysPane.svelte';
	import { LayoutEditor, type Tab } from './editor.svelte';
	import KeysPane from './keys/KeysPane.svelte';
	import KeysToolbar from './keys/KeysToolbar.svelte';
	import LayoutSettings from './settings/LayoutSettings.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	const TABS: { value: Tab; label: string }[] = [
		{ value: 'keys', label: 'Keys' },
		{ value: 'dead', label: 'Dead keys' },
		{ value: 'settings', label: 'Settings' }
	];
	const TAB_SHORTCUTS: Record<string, Tab> = { Digit1: 'keys', Digit2: 'dead', Digit3: 'settings' };

	let editor = $state<LayoutEditor | null>(null);
	let baseName = $state('');

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

	function switchTab(event: KeyboardEvent) {
		const tab = TAB_SHORTCUTS[event.code];
		if (!editor || !tab || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
		event.preventDefault();
		editor.tab = tab;
	}

	async function remove() {
		editor?.discard();
		await deleteLayout(id);
		await app.removed();
	}
</script>

<svelte:window onkeydown={switchTab} />

{#if editor}
	{@const current = editor}
	<Page title={current.layout.name} wide>
		{#snippet actions()}
			<UndoButtons target={current} />
			<SourceActions
				selection={{ kind: 'layout', id }}
				what="layout"
				onuse={() => useLayout(id)}
				exports={[
					{ label: 'Export layout file', run: () => exportLayout(id, 'symbols') },
					{ label: 'Export as a complete keymap', run: () => exportLayout(id, 'keymap') },
					...(current.layout.dead.length ? [{ label: 'Export dead keys as a Compose file', run: () => exportLayout(id, 'compose') }] : []),
					{ label: 'Export for Windows', run: () => exportLayout(id, 'klc') }
				]}
				onremove={remove}
			>
				{#snippet menu(close)}
					<ShapeItems value={current.geometry} onchange={(geometry) => current.setGeometry(geometry)} {close} />
				{/snippet}
			</SourceActions>
		{/snippet}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="w-[320px] max-w-full">
				<Segmented label="What to edit" options={TABS} value={current.tab} onchange={(tab) => (current.tab = tab)} />
			</div>
			{#if current.tab === 'keys'}
				<KeysToolbar editor={current} />
			{/if}
		</div>
		{#if current.tab === 'keys'}
			<KeysPane editor={current} />
		{:else if current.tab === 'dead'}
			<DeadKeysPane editor={current} />
		{:else}
			<LayoutSettings editor={current} {baseName} />
		{/if}
	</Page>
{/if}
