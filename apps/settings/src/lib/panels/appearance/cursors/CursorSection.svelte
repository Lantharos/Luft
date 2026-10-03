<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import { Dialog, Row, Section, Select } from '@luft/ui';
	import MoreRow from '#lib/components/MoreRow.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { openCursorFolder, removeCursorTheme, type CursorTheme } from './api';
	import { cursors } from './cursors.svelte';
	import CursorTile from './CursorTile.svelte';

	interface Props {
		onbrowse: () => void;
	}

	let { onbrowse }: Props = $props();

	type Interface = {
		'cursor-theme': string;
		'cursor-size': number;
	};

	const SIZES = [
		{ value: 24, label: 'Default' },
		{ value: 32, label: 'Medium' },
		{ value: 48, label: 'Large' },
		{ value: 64, label: 'Larger' },
		{ value: 96, label: 'Largest' }
	];

	const COLLAPSED = 6;

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['cursor-theme', 'cursor-size']);

	let removing = $state<CursorTheme | null>(null);
	let problem = $state('');
	let expanded = $state(false);

	let current = $derived(desktop.values['cursor-theme'] ?? 'Adwaita');
	let themes = $derived(cursors.themes ?? []);
	let shown = $derived.by(() => {
		if (expanded) return themes;
		const first = themes.slice(0, COLLAPSED);
		const chosen = themes.find((theme) => theme.name === current);
		return !chosen || first.includes(chosen) ? first : [...first.slice(0, -1), chosen];
	});

	async function remove(theme: CursorTheme) {
		removing = null;
		problem = '';
		try {
			if (theme.name === current) await desktop.reset('cursor-theme');
			await removeCursorTheme(theme.name);
			await cursors.load();
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
		}
	}

	void cursors.load();
</script>

<svelte:window onfocus={() => cursors.load()} />

<Section title="Cursor">
	{#if problem}
		<p class="px-4 pt-3.5 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-2 p-3">
		{#each shown as theme (theme.name)}
			<CursorTile {theme} selected={theme.name === current} onselect={() => desktop.set('cursor-theme', theme.name)} onremove={() => (removing = theme)} />
		{/each}
	</div>
	{#if themes.length > COLLAPSED}
		<MoreRow hidden={themes.length - COLLAPSED} bind:expanded />
	{/if}
	<Row title="Size">
		<Select label="Cursor size" options={SIZES} value={desktop.values['cursor-size'] ?? 24} onchange={(size) => desktop.set('cursor-size', size)} />
	</Row>
	<Row title="Get more cursors" description="Browse themes shared on GNOME-Look" icon={Download} onclick={onbrowse} />
	<Row title="Cursors folder" description="Themes you put in Home › .local › share › icons show up here" icon={FolderOpen} onclick={openCursorFolder} />
</Section>

{#if removing}
	{@const theme = removing}
	<Dialog title="Remove {theme.title}?" description="The theme is deleted from your icons folder." onclose={() => (removing = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>Cancel</button>
			<button type="button" class="button danger" onclick={() => remove(theme)}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
