<script lang="ts">
	import { untrack } from 'svelte';
	import Info from '@lucide/svelte/icons/info';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { bytes, Select, TextField, tooltip } from '@luft/ui';
	import type { Filesystem } from '#lib/api.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { format, place, remove, rename } from '#lib/editor/edits.js';
	import type { Limits } from '#lib/editor/limits.js';
	import type { Layout, Part } from '#lib/editor/model.js';
	import { FILESYSTEM_NAMES, LABEL_LIMITS } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import Disclosure from '#lib/components/Disclosure.svelte';
	import ExactSize from './ExactSize.svelte';
	import PartitionSettings from './PartitionSettings.svelte';
	import SizeInput from './SizeInput.svelte';

	interface Props {
		layout: Layout;
		part: Part;
		limits: Limits;
	}

	let { layout, part, limits }: Props = $props();

	const KEEP = 'keep';
	const EMPTY = 'empty';
	const FILESYSTEMS: Filesystem[] = ['ext4', 'btrfs', 'exfat', 'ntfs', 'vfat'];

	let label = $state('');

	$effect.pre(() => {
		label = part.label;
	});

	let changeable = $derived(!part.system && !editor.running);
	let fresh = $derived(part.pending || part.replaced);
	let lastIsCreate = $derived(editor.steps.at(-1)?.kind === 'create' && editor.steps.at(-1)?.key === part.key);
	let contents = $derived([
		...(fresh ? [] : [{ value: KEEP, label: 'Keep what’s on it' }]),
		...FILESYSTEMS.filter((filesystem) => disks.support(filesystem)?.available ?? true).map((filesystem) => ({
			value: filesystem as string,
			label: fresh ? FILESYSTEM_NAMES[filesystem] : `Erase as ${FILESYSTEM_NAMES[filesystem]}`
		})),
		...(part.pending && lastIsCreate ? [{ value: EMPTY, label: 'No file system' }] : [])
	]);
	const created = untrack(() => part.pending && lastIsCreate);
	let chosen = $derived(fresh ? part.filesystem || EMPTY : KEEP);
	let named = $derived(chosen !== EMPTY && (part.usage === 'filesystem' || fresh) && !part.locked);
	let limit = $derived(LABEL_LIMITS[part.filesystem as Filesystem] ?? 255);
	let largest = $derived(Math.min(limits.largest, limits.after - part.offset));
	let facts = $derived(
		[
			part.pending ? 'New' : part.locked ? 'Locked' : part.filesystem ? (FILESYSTEM_NAMES[part.filesystem] ?? part.filesystem) : 'No file system',
			part.used !== null && !part.replaced && `${bytes(part.used)} used`
		]
			.filter(Boolean)
			.join(' · ')
	);

	function chooseContents(value: string) {
		if (value !== KEEP) format(part, value === EMPTY ? '' : value);
	}

	function commitLabel() {
		if (label.length <= limit) rename(part, label);
	}
</script>

<section class={['inspector', editor.exact && 'wide']} aria-label={part.title}>
	<header class="flex items-center gap-1 pl-1">
		<h2 class="min-w-0 truncate text-[15px] font-semibold">{part.title}</h2>
		<span class="ml-1.5 flex-none text-[13px] text-[var(--text-muted)]">{facts}</span>
		{#if limits.notes.length}
			<span class="grid h-8 w-8 flex-none place-items-center text-[var(--text-muted)]" aria-label={limits.notes.join(' ')} {@attach tooltip(limits.notes.join(' '))}>
				<Info size={15} />
			</span>
		{/if}
		<span class="flex-1"></span>
		{#if changeable}
			<PartitionSettings {layout} {part} />
			<button type="button" class="icon-button delete" aria-label="Delete" {@attach tooltip('Delete')} onclick={() => remove(part)}>
				<Trash2 size={17} />
			</button>
		{/if}
	</header>

	<div class="fields">
		<span class="label">Size</span>
		{#if editor.exact}
			<ExactSize {layout} {part} {limits} focused={created} />
		{:else}
			<SizeInput label="Size" focused={created} value={part.size} min={limits.smallest} max={largest} oncommit={(next) => place(part, part.offset, next)} />
		{/if}
		<Disclosure bind:open={editor.exact} hint={tooltip('Exact size in MiB')}>MiB</Disclosure>

		{#if changeable}
			<span class="label">Format</span>
			<div class="col-span-2">
				<Select label="Format" options={contents} value={chosen} onchange={chooseContents} />
			</div>
			{#if named}
				<span class="label">Name</span>
				<div class="col-span-2" onfocusout={commitLabel}>
					<TextField
						label="Name"
						placeholder="Untitled"
						bind:value={label}
						error={label.length > limit ? `Up to ${limit} characters` : ''}
						live
						onkeydown={(event) => event.key === 'Enter' && commitLabel()}
					/>
				</div>
			{/if}
		{/if}
	</div>
</section>

<style>
	.inspector {
		display: flex;
		width: 400px;
		max-width: 100%;
		flex-direction: column;
		gap: 12px;
		border-radius: var(--radius-group);
		background: var(--group);
		padding: 10px 12px 14px;
	}

	.wide {
		width: 560px;
	}

	.fields {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr) auto;
		align-items: center;
		gap: 8px 10px;
	}

	.label {
		padding-left: 4px;
		font-size: 13px;
		color: var(--text-muted);
	}

	.delete:hover:not(:disabled) {
		color: var(--danger);
	}
</style>
