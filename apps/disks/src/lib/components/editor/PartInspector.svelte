<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { bytes, Row, Select, Switch, TextField, tooltip } from '@luft/ui';
	import type { Filesystem } from '#lib/api.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { format, remove, rename, renamePartition, retype, setFlag } from '#lib/editor/edits.js';
	import type { Limits } from '#lib/editor/limits.js';
	import type { Layout, Part } from '#lib/editor/model.js';
	import { FILESYSTEM_NAMES, LABEL_LIMITS } from '#lib/format.js';
	import { FLAGS, typeFor, typeName, typeOptions } from '#lib/partitions/types.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import Geometry from './Geometry.svelte';

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
	let name = $state('');

	$effect.pre(() => {
		label = part.label;
		name = part.name;
	});

	let changeable = $derived(!part.system && !editor.running);
	let lastIsCreate = $derived(editor.steps.at(-1)?.kind === 'create' && editor.steps.at(-1)?.key === part.key);
	let contents = $derived([
		...(part.pending || part.replaced ? [] : [{ value: KEEP, label: 'Keep what’s on it' }]),
		...FILESYSTEMS.filter((filesystem) => disks.support(filesystem)?.available ?? true).map((filesystem) => ({
			value: filesystem as string,
			label: part.pending || part.replaced ? FILESYSTEM_NAMES[filesystem] : `Erase and format as ${FILESYSTEM_NAMES[filesystem]}`
		})),
		...(part.pending && lastIsCreate ? [{ value: EMPTY, label: 'No file system' }] : [])
	]);
	let chosen = $derived(part.pending || part.replaced ? part.filesystem || EMPTY : KEEP);
	let limit = $derived(LABEL_LIMITS[part.filesystem as Filesystem] ?? 255);
	let types = $derived(typeOptions(layout.table, part.type || typeFor(layout.table, part.filesystem)));
	let facts = $derived(
		[
			part.pending ? 'New' : part.locked ? 'Encrypted, locked' : part.filesystem ? (FILESYSTEM_NAMES[part.filesystem] ?? part.filesystem) : 'No file system',
			bytes(part.size),
			part.used !== null && !part.replaced && `${bytes(part.used)} used`,
			part.mounted && 'Mounted'
		]
			.filter(Boolean)
			.join(' · ')
	);

	function chooseContents(value: string) {
		if (value === KEEP) return;
		format(part, value === EMPTY ? '' : value);
	}
</script>

<section class="flex flex-col gap-5">
	<div class="flex items-start gap-3 px-1">
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<h2 class="truncate text-[16px] font-semibold">{part.title}</h2>
			<p class="text-[13px] text-[var(--text-muted)]">{facts}</p>
		</div>
		{#if changeable}
			<button type="button" class="button danger" onclick={() => remove(part)}>Delete</button>
		{/if}
		<button type="button" class="icon-button" aria-label="Show all partitions" onclick={() => (editor.selected = null)} {@attach tooltip('Show all partitions')}>
			<X size={18} />
		</button>
	</div>

	<Geometry {layout} {part} {limits} />

	{#if limits.notes.length}
		<div class="flex flex-col gap-1 px-1 text-[12.5px] text-[var(--text-muted)]">
			{#each limits.notes as note (note)}
				<p>{note}</p>
			{/each}
		</div>
	{/if}

	{#if changeable}
		<div class="row-group">
			<Row title="Contents" description={chosen === KEEP ? 'Files on it stay where they are' : 'Made when the changes are applied'}>
				<Select label="Contents" options={contents} value={chosen} onchange={chooseContents} />
			</Row>
			{#if chosen !== EMPTY && (part.usage === 'filesystem' || part.pending || part.replaced) && !part.locked}
				<Row title="Name" description="Shown in Rover and the sidebar">
					<div class="w-[220px]" onfocusout={() => label.length <= limit && rename(part, label)}>
						<TextField
							label="Name"
							placeholder="Untitled"
							bind:value={label}
							error={label.length > limit ? `Up to ${limit} characters` : ''}
							live
							onkeydown={(event) => event.key === 'Enter' && label.length <= limit && rename(part, label)}
						/>
					</div>
				</Row>
			{/if}
			<Row title="Partition type" description={part.type ? undefined : `Set from the format: ${typeName(typeFor(layout.table, part.filesystem))}`}>
				<Select label="Partition type" options={types} value={part.type || typeFor(layout.table, part.filesystem)} onchange={(value) => retype(part, value)} />
			</Row>
			{#if layout.table === 'gpt'}
				<Row title="Partition name" description="Stored in the partition table">
					<div class="w-[220px]" onfocusout={() => renamePartition(part, name)}>
						<TextField label="Partition name" placeholder="None" bind:value={name} onkeydown={(event) => event.key === 'Enter' && renamePartition(part, name)} />
					</div>
				</Row>
			{/if}
			{#each FLAGS[layout.table] as flag (flag.bit)}
				<Row title={flag.label} description={flag.description}>
					<Switch label={flag.label} checked={part.flags.includes(flag.bit)} onchange={(on) => setFlag(part, flag.bit, on)} />
				</Row>
			{/each}
		</div>
	{/if}
</section>
