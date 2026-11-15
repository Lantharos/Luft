<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Row } from '@luft/ui';
	import type { Extension, PageItem as Item } from '#lib/bindings.js';
	import RowValue from '#lib/components/RowValue.svelte';
	import PageItem from './PageItem.svelte';

	type Group = Extract<Item, { type: 'group' }>;

	let { extension, group }: { extension: Extension; group: Group } = $props();

	let open = $state(false);

	const close = () => (open = false);
</script>

<Row title={group.title} description={group.description ?? undefined} onclick={() => (open = true)}>
	{#if group.value}<RowValue text={group.value} />{/if}
</Row>

{#if open}
	<Dialog title={group.title} wide onclose={close}>
		<div class="row-group">
			{#each group.items as item, number (number)}
				<PageItem {extension} {item} />
			{/each}
		</div>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={close}>{t('settings-more-done')}</button>
		{/snippet}
	</Dialog>
{/if}
