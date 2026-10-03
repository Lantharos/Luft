<script lang="ts">
	import { bytes, Dialog, plural } from '@luft/ui';
	import * as api from '#lib/api.js';
	import * as features from '#lib/features/api.js';
	import type { Measurement, Ownership } from '#lib/features/types.js';
	import type { FileEntry } from '#lib/types/index.js';
	import type { FileDetails } from '#lib/types/details.js';
	import { errorMessage, formatFullDate } from '#lib/utils/format.js';
	import { parentPath } from '#lib/utils/paths.js';
	import DefaultApp from './DefaultApp.svelte';
	import PermissionGrid from './PermissionGrid.svelte';

	interface Props {
		entries: FileEntry[];
		onclose: () => void;
	}

	let { entries, onclose }: Props = $props();

	let details = $state.raw<FileDetails | null>(null);
	let ownership = $state.raw<Ownership | null>(null);
	let measurement = $state.raw<Measurement | null>(null);
	let error = $state<string | null>(null);

	let single = $derived(entries.length === 1 ? entries[0] : null);
	let measured = $derived(entries.some((entry) => entry.is_dir) || entries.length > 1);
	let locations = $derived(new Set(entries.map((entry) => parentPath(entry.path))));
	let title = $derived(single?.name ?? plural(entries.length, 'item'));
	let kind = $derived(single ? (details?.kind ?? '') : describeMix(entries));
	let octal = $derived(ownership ? (ownership.mode & 0o777).toString(8).padStart(3, '0') : '');

	$effect(() => {
		if (!single) return;
		const path = single.path;
		void api.fileDetails(path).then((result) => (details = result)).catch(() => (details = null));
		void features.fileOwnership(path).then((result) => (ownership = result)).catch(() => (ownership = null));
	});

	$effect(() => {
		if (!measured) return;
		let id: number | null = null;
		const early = new Map<number, Measurement>();
		const stop = features.events.measure((update) => {
			if (id === null) early.set(update.id, update);
			else if (update.id === id) measurement = update;
		});
		void features.measure(entries.map((entry) => entry.path)).then((started) => {
			id = started;
			measurement = early.get(started) ?? measurement;
		});
		return () => {
			stop();
			if (id !== null) void features.cancelMeasure(id);
		};
	});

	function describeMix(items: FileEntry[]) {
		const folders = items.filter((item) => item.is_dir).length;
		const files = items.length - folders;
		return [folders && plural(folders, 'folder'), files && plural(files, 'file')].filter(Boolean).join(' and ');
	}

	function sizeText() {
		if (!measured) return single ? `${bytes(single.size)} (${single.size.toLocaleString()} bytes)` : '';
		if (!measurement) return 'Measuring…';
		const contents = plural(measurement.files, 'file');
		const folders = measurement.folders > 0 ? `, ${plural(measurement.folders, 'folder')}` : '';
		return `${bytes(measurement.bytes)} · ${contents}${folders}${measurement.done ? '' : '…'}`;
	}

	async function changeMode(mode: number) {
		if (!single || !ownership) return;
		const previous = ownership;
		ownership = { ...ownership, mode };
		error = null;
		try {
			await features.setPermissions(single.path, mode);
		} catch (caught) {
			ownership = previous;
			error = errorMessage(caught);
		}
	}
</script>

{#snippet row(label: string, value: string)}
	{#if value}
		<dt class="text-[var(--text-muted)]">{label}</dt>
		<dd class="min-w-0 break-words text-[var(--text-soft)] select-text">{value}</dd>
	{/if}
{/snippet}

<Dialog {title} wide {onclose}>
	<dl class="grid grid-cols-[112px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13px]">
		{@render row('Kind', kind)}
		{@render row('Size', sizeText())}
		{@render row('Location', locations.size === 1 ? [...locations][0] : 'Several folders')}
		{#if single}
			{@render row('Points to', details?.linkTarget ?? '')}
			{@render row('Dimensions', details?.dimensions ? `${details.dimensions[0]} × ${details.dimensions[1]} pixels` : '')}
			{@render row('Created', formatFullDate(details?.created ?? null))}
			{@render row('Modified', formatFullDate(single.modified))}
			{@render row('Opened', formatFullDate(details?.accessed ?? null))}
			{#if ownership}
				{@render row('Owner', `${ownership.owner} · group ${ownership.group}`)}
			{/if}
		{/if}
	</dl>

	{#if single && ownership}
		<div class="flex flex-col gap-2 pt-2">
			<div class="flex items-baseline justify-between text-[13px]">
				<span class="font-medium">Permissions</span>
				<span class="font-mono text-[12px] text-[var(--text-muted)]">{octal}</span>
			</div>
			<PermissionGrid mode={ownership.mode} folder={single.is_dir} editable={ownership.editable} onchange={changeMode} />
			{#if !ownership.editable}
				<p class="text-[12px] text-[var(--text-muted)]">Only {ownership.owner} can change these.</p>
			{/if}
		</div>
	{/if}

	{#if single && !single.is_dir}
		<div class="flex flex-col gap-2 pt-2 text-[13px]">
			<span class="font-medium">Opens with</span>
			<DefaultApp path={single.path} />
		</div>
	{/if}

	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
