<script lang="ts">
	import { bytes, plural, Row, Section, Spinner } from '@luft/ui';
	import type { Amount, Cleanup, Reclaim } from '#lib/bindings.js';
	import { showInRover } from '#lib/bridge/index.js';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import ActionMenu from '../ActionMenu.svelte';

	interface Props {
		reclaim: Reclaim;
	}

	let { reclaim }: Props = $props();

	const PLACES: { what: Cleanup; title: string; description: (amount: Amount) => string; action: string }[] = [
		{ what: 'trash', title: 'Trash', description: () => 'Things you deleted, kept until the trash is emptied', action: 'Empty' },
		{
			what: 'downloads',
			title: 'Downloads older than 30 days',
			description: (amount) => (amount.measured && amount.items ? `${plural(amount.items, 'item')} that haven’t changed in a month` : 'Nothing in Downloads is that old'),
			action: 'Move to trash'
		},
		{ what: 'caches', title: 'App caches', description: () => 'Copies apps keep to open faster and make again when needed', action: 'Clear' }
	];

	let places = $derived(PLACES.flatMap((place) => (reclaim[place.what] ? [{ ...place, amount: reclaim[place.what]! }] : [])));

	const folder = (path: string[]) => path.slice(0, -1).join('/');
	const name = (path: string[]) => path.at(-1) ?? '';
</script>

<Section title="Free up space">
	{#each places as { what, title, description, action, amount } (what)}
		<Row {title} description={description(amount)}>
			<span class="size">
				{#if !amount.measured}<Spinner size={13} />{/if}
				{bytes(amount.size)}
			</span>
			<button type="button" class="button" disabled={!amount.measured || amount.size === 0} onclick={() => dialogs.open({ kind: 'clean', what, size: amount.size, items: amount.items })}>
				{action}
			</button>
		</Row>
	{/each}
</Section>

{#if reclaim.largest.length}
	<Section title="Largest files">
		{#each reclaim.largest as file (file.path.join('/'))}
			<Row title={name(file.path)} description={folder(file.path)} truncate>
				<span class="size">{bytes(file.size)}</span>
				<button type="button" class="button" onclick={() => dialogs.open({ kind: 'trash', path: file.path, name: name(file.path), size: file.size, folder: false })}>Move to trash</button>
				<ActionMenu label="More for {name(file.path)}" groups={[[{ label: 'Show in Rover', run: () => void showInRover(file.path).catch((caught) => disks.fail(caught)) }]]} />
			</Row>
		{/each}
	</Section>
{/if}

<style>
	.size {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}
</style>
