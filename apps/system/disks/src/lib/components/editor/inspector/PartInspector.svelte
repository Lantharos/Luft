<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import Info from '@lucide/svelte/icons/info';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { bytes, Dialog, Select, TextField, tooltip } from '@luft/ui';
	import type { Filesystem } from '#lib/bindings.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { format, place, remove, rename } from '#lib/editor/edits.js';
	import type { Limits } from '#lib/editor/limits.js';
	import type { Layout, Part } from '#lib/editor/model.js';
	import { filesystemLabel, LABEL_LIMITS } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
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
	let exact = $state(false);

	$effect.pre(() => {
		label = part.label;
	});

	let changeable = $derived(!part.system && !editor.running);
	let fresh = $derived(part.pending || part.replaced);
	let lastIsCreate = $derived(editor.steps.at(-1)?.kind === 'create' && editor.steps.at(-1)?.key === part.key);
	let contents = $derived([
		...(fresh ? [] : [{ value: KEEP, label: t('disks-editor-keep') }]),
		...FILESYSTEMS.filter((filesystem) => disks.support(filesystem)?.available ?? true).map((filesystem) => ({
			value: filesystem as string,
			label: fresh ? filesystemLabel(filesystem) : t('disks-editor-erase-as', { filesystem: filesystemLabel(filesystem) })
		})),
		...(part.pending && lastIsCreate ? [{ value: EMPTY, label: t('disks-editor-no-filesystem') }] : [])
	]);
	const created = untrack(() => part.pending && lastIsCreate);
	let chosen = $derived(fresh ? part.filesystem || EMPTY : KEEP);
	let named = $derived(chosen !== EMPTY && (part.usage === 'filesystem' || fresh) && !part.locked);
	let limit = $derived(LABEL_LIMITS[part.filesystem as Filesystem] ?? 255);
	let largest = $derived(Math.min(limits.largest, limits.after - part.offset));
	let facts = $derived(
		[
			part.pending ? t('disks-editor-new') : part.locked ? t('disks-editor-locked') : part.filesystem ? filesystemLabel(part.filesystem) : t('disks-editor-no-filesystem'),
			part.used !== null && !part.replaced && t('disks-used', { size: bytes(part.used) })
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

<section class="inspector" aria-label={part.title}>
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
			<button type="button" class="icon-button delete" aria-label={t('disks-editor-delete')} {@attach tooltip(t('disks-editor-delete'))} onclick={() => remove(part)}>
				<Trash2 size={17} />
			</button>
		{/if}
	</header>

	<div class="fields">
		<span class="label">{t('disks-editor-size')}</span>
		<SizeInput label={t('disks-editor-size')} focused={created} value={part.size} min={limits.smallest} max={largest} oncommit={(next) => place(part, part.offset, next)} />
		<button type="button" class="button" {@attach tooltip(t('disks-editor-exact.tooltip'))} onclick={() => (exact = true)}>{t('disks-editor-exact')}</button>

		{#if changeable}
			<span class="label">{t('disks-editor-format')}</span>
			<div class="col-span-2">
				<Select label={t('disks-editor-format')} options={contents} value={chosen} onchange={chooseContents} />
			</div>
			{#if named}
				<span class="label">{t('disks-editor-name')}</span>
				<div class="col-span-2" onfocusout={commitLabel}>
					<TextField
						label={t('disks-editor-name')}
						placeholder={t('disks-untitled')}
						bind:value={label}
						error={label.length > limit ? t('disks-editor-name-limit', { limit }) : ''}
						live
						onkeydown={(event) => event.key === 'Enter' && commitLabel()}
					/>
				</div>
			{/if}
		{/if}
	</div>
</section>

{#if exact}
	<Dialog title={t('disks-editor-exact-title', { name: part.title })} wide onclose={() => (exact = false)}>
		<ExactSize {layout} {part} {limits} focused />
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (exact = false)}>{t('disks-done')}</button>
		{/snippet}
	</Dialog>
{/if}

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
