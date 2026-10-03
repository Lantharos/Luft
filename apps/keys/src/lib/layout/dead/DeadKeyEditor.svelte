<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, Row, Section, TextField } from '@luft/ui';
	import type { DeadKey } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import DeadKeyHeader from './DeadKeyHeader.svelte';
	import PairGrid from './PairGrid.svelte';
	import { whereIs } from './table';
	import TryDeadKey from './TryDeadKey.svelte';

	interface Props {
		editor: LayoutEditor;
		key: DeadKey;
	}

	let { editor, key }: Props = $props();

	let places = $derived(editor.placesOf(key.keysym));
	let where = $derived(whereIs(editor.layout.keys, key.keysym));

	function putOnKey() {
		editor.placing = key.keysym;
		editor.tab = 'keys';
	}
</script>

<div class="flex min-w-0 flex-col gap-7">
	<DeadKeyHeader symbol={key.symbol} name={key.name} {where}>
		<button type="button" class="button" onclick={putOnKey}>{places.length ? 'Put on another key' : 'Put on a key'}</button>
		<MenuButton label="More" class="icon-button" align="end">
			{#snippet trigger()}
				<Ellipsis size={18} />
			{/snippet}
			{#snippet children(close)}
				<MenuItem
					danger
					onclick={() => {
						close();
						editor.removeDead(key.keysym);
					}}>Remove dead key</MenuItem
				>
			{/snippet}
		</MenuButton>
	</DeadKeyHeader>

	<PairGrid {editor} {key} />

	<section class="flex flex-col gap-2">
		<h2 class="px-1.5 text-[14px] font-semibold text-[var(--text-soft)]">Try it</h2>
		<TryDeadKey {editor} {key} />
		<p class="px-1.5 text-[12.5px] text-[var(--text-muted)]">Most apps use changes right away. Some, such as many terminals, use them once they're reopened.</p>
	</section>

	<Section title="Details">
		<Row title="Name">
			<div class="w-[240px]">
				<TextField label="Name" bind:value={() => key.name, (name) => editor.updateDead(key.keysym, 'name', name)} />
			</div>
		</Row>
		<Row title="Shown on the key">
			<div class="w-[120px]">
				<TextField label="Shown on the key" bind:value={() => key.symbol, (symbol) => editor.updateDead(key.keysym, 'symbol', symbol)} />
			</div>
		</Row>
		<Row title="With Space or pressed twice" description="Also what comes before a key that has nothing of its own">
			<div class="w-[120px]">
				<TextField label="With Space or pressed twice" bind:value={() => key.spacing, (spacing) => editor.updateDead(key.keysym, 'spacing', spacing)} />
			</div>
		</Row>
	</Section>
</div>
