<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import type { DeadKey } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import DeadKeyDetails from './DeadKeyDetails.svelte';
	import DeadKeyHeader from './DeadKeyHeader.svelte';
	import PairGrid from './PairGrid.svelte';
	import { whereIs } from './table';
	import TryDeadKey from './TryDeadKey.svelte';

	interface Props {
		editor: LayoutEditor;
		key: DeadKey;
	}

	let { editor, key }: Props = $props();

	let where = $derived(whereIs(editor.layout.keys, key.keysym));
	let placed = $derived(editor.placesOf(key.keysym).length > 0);

	function putOnKey() {
		editor.placing = key.keysym;
		editor.tab = 'keys';
	}
</script>

<div class="flex min-w-0 flex-col gap-5">
	<DeadKeyHeader symbol={key.symbol} name={key.name} {where}>
		<DeadKeyDetails {editor} {key} />
		<button type="button" class="icon-button" aria-label={placed ? 'Put on another key' : 'Put on a key'} {@attach tooltip(placed ? 'Put on another key' : 'Put on a key')} onclick={putOnKey}>
			<Keyboard size={18} />
		</button>
		<MenuButton label="More" class="icon-button" align="end" minWidth={200}>
			{#snippet trigger()}
				<Ellipsis size={18} />
			{/snippet}
			{#snippet children(close)}
				<MenuItem
					onclick={() => {
						close();
						editor.addCapitals(key.keysym);
					}}>Add capitals</MenuItem
				>
				<MenuSeparator />
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
	<TryDeadKey {editor} {key} />
	<PairGrid {editor} {key} />
</div>
