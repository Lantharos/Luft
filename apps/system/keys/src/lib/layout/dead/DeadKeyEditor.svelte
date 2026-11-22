<script lang="ts">
	import { t } from '@luft/i18n';
	import Ellipsis from '@luft/symbols/icons/ellipsis';
	import Keyboard from '@luft/symbols/icons/keyboard';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import type { DeadKey } from '#lib/bindings.js';
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
		<button type="button" class="icon-button" aria-label={placed ? t('keys-dead-place-again') : t('keys-dead-place')} {@attach tooltip(placed ? t('keys-dead-place-again') : t('keys-dead-place'))} onclick={putOnKey}>
			<Keyboard size={18} />
		</button>
		<MenuButton label={t('keys-more')} class="icon-button" align="end" minWidth={200}>
			{#snippet trigger()}
				<Ellipsis size={18} />
			{/snippet}
			{#snippet children(close)}
				<MenuItem
					onclick={() => {
						close();
						editor.addCapitals(key.keysym);
					}}>{t('keys-dead-add-capitals')}</MenuItem
				>
				<MenuSeparator />
				<MenuItem
					danger
					onclick={() => {
						close();
						editor.removeDead(key.keysym);
					}}>{t('keys-dead-remove')}</MenuItem
				>
			{/snippet}
		</MenuButton>
	</DeadKeyHeader>
	<TryDeadKey {editor} {key} />
	<PairGrid {editor} {key} />
</div>
