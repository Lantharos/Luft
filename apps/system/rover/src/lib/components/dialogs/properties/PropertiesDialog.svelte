<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, dateTime, Dialog, errorText, parent, Spinner } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import { exploreSpace } from '#lib/bridge/index.js';
	import type { DriveInfo, FileDetails, FileEntry, Measurement, Ownership } from '#lib/bindings.js';
	import DefaultApp from './DefaultApp.svelte';
	import PermissionGrid from './PermissionGrid.svelte';

	interface Props {
		entries: FileEntry[];
		drive?: DriveInfo;
		onclose: () => void;
	}

	let { entries, drive, onclose }: Props = $props();

	let details = $state.raw<FileDetails | null>(null);
	let ownership = $state.raw<Ownership | null>(null);
	let measurement = $state.raw<Measurement | null>(null);
	let error = $state<string | null>(null);

	let single = $derived(entries.length === 1 ? entries[0] : null);
	let measured = $derived(!drive && (entries.some((entry) => entry.isDir) || entries.length > 1));
	let locations = $derived(new Set(entries.map((entry) => parent(entry.path))));
	let title = $derived(drive?.name ?? single?.name ?? t('rover-properties-items', { count: entries.length }));
	let kind = $derived(drive ? t('rover-properties-kind-drive') : single ? (details?.kind ?? '') : describeMix(entries));
	let octal = $derived(ownership ? (ownership.mode & 0o777).toString(8).padStart(3, '0') : '');

	$effect(() => {
		if (!single) return;
		const path = single.path;
		void commands.fileDetails({ path }).then((result) => (details = result)).catch(() => (details = null));
		void commands.fileOwnership({ path }).then((result) => (ownership = result)).catch(() => (ownership = null));
	});

	$effect(() => {
		if (!measured) return;
		let id: number | null = null;
		const early = new Map<number, Measurement>();
		const stop = events.roverMeasure((update) => {
			if (id === null) early.set(update.id, update);
			else if (update.id === id) measurement = update;
		});
		void commands.measure({ paths: entries.map((entry) => entry.path) }).then((started) => {
			id = started;
			measurement = early.get(started) ?? measurement;
		});
		return () => {
			stop();
			if (id !== null) void commands.cancelMeasure({ id });
		};
	});

	function describeMix(items: FileEntry[]) {
		const folders = items.filter((item) => item.isDir).length;
		const files = items.length - folders;
		if (!files) return t('rover-properties-kind-folders', { folders });
		if (!folders) return t('rover-properties-kind-files', { files });
		return t('rover-properties-kind-mixed', { folders, files });
	}

	function sizeText() {
		if (drive) return t('rover-properties-drive-size', { used: bytes(drive.usedSpace), total: bytes(drive.totalSpace) });
		if (!measured) return single ? t('rover-properties-file-size', { size: bytes(single.size), bytes: single.size }) : '';
		if (!measurement) return t('rover-properties-measuring');
		const size = bytes(measurement.bytes);
		if (measurement.folders > 0) return t('rover-properties-contents-folders', { size, files: measurement.files, folders: measurement.folders });
		return t('rover-properties-contents', { size, files: measurement.files });
	}

	async function changeMode(mode: number) {
		if (!single || !ownership) return;
		const previous = ownership;
		ownership = { ...ownership, mode };
		error = null;
		try {
			await commands.setPermissions({ path: single.path, mode });
		} catch (caught) {
			ownership = previous;
			error = errorText(caught);
		}
	}
</script>

{#snippet row(label: string, value: string, working = false)}
	{#if value}
		<dt class="text-[var(--text-muted)]">{label}</dt>
		<dd class="flex min-w-0 items-center gap-2 break-words text-[var(--text-soft)] select-text">
			{#if working}<Spinner size={13} class="text-[var(--text-muted)]" />{/if}
			<span class="min-w-0">{value}</span>
		</dd>
	{/if}
{/snippet}

<Dialog {title} wide {onclose}>
	<dl class="grid grid-cols-[112px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13px]">
		{@render row(t('rover-properties-kind'), kind)}
		{@render row(t('rover-properties-size'), sizeText(), measured && !measurement?.done)}
		{@render row(t('rover-properties-free'), drive ? bytes(drive.availableSpace) : '')}
		{@render row(t('rover-properties-location'), locations.size === 1 ? [...locations][0] : t('rover-properties-several-folders'))}
		{#if single}
			{@render row(t('rover-properties-points-to'), details?.linkTarget ?? '')}
			{@render row(t('rover-properties-dimensions'), details?.dimensions ? t('rover-properties-pixels', { width: String(details.dimensions[0]), height: String(details.dimensions[1]) }) : '')}
			{@render row(t('rover-properties-created'), details?.created ? dateTime(details.created) : '')}
			{@render row(t('rover-properties-modified'), single.modified ? dateTime(single.modified) : '')}
			{@render row(t('rover-properties-opened'), details?.accessed ? dateTime(details.accessed) : '')}
			{#if ownership}
				{@render row(t('rover-properties-owner'), t('rover-properties-owner-value', { owner: ownership.owner, group: ownership.group }))}
			{/if}
		{/if}
	</dl>

	{#if single && ownership}
		<div class="flex flex-col gap-2 pt-2">
			<div class="flex items-baseline justify-between text-[13px]">
				<span class="font-medium">{t('rover-properties-permissions')}</span>
				<span class="font-mono text-[12px] text-[var(--text-muted)]">{octal}</span>
			</div>
			<PermissionGrid mode={ownership.mode} folder={single.isDir} editable={ownership.editable} onchange={changeMode} />
			{#if !ownership.editable}
				<p class="text-[12px] text-[var(--text-muted)]">{t('rover-properties-owner-only', { owner: ownership.owner })}</p>
			{/if}
		</div>
	{/if}

	{#if single && !single.isDir}
		<div class="flex flex-col gap-2 pt-2 text-[13px]">
			<span class="font-medium">{t('rover-properties-opens-with')}</span>
			<DefaultApp path={single.path} />
		</div>
	{/if}

	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		{#if drive}
			{@const folder = drive.mountPoint}
			<button class="button" type="button" onclick={() => exploreSpace(folder).then(onclose, (caught) => (error = errorText(caught)))}>{t('rover-free-up-space')}</button>
		{/if}
		<button class="button" type="button" onclick={onclose}>{t('rover-properties-done')}</button>

	{/snippet}
</Dialog>
