<script lang="ts">
	import { t } from '@luft/i18n';
	import Download from '@lucide/svelte/icons/download';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import { Dialog, errorText, Row, Section, Select } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { CursorTheme } from '#lib/bindings.js';
	import MoreRow from '#lib/components/MoreRow.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { openCursorFolder } from './api';
	import { cursors } from './cursors.svelte';
	import { cursorSizes } from './sizes';
	import CursorTile from './CursorTile.svelte';

	interface Props {
		onbrowse: () => void;
	}

	let { onbrowse }: Props = $props();

	type Interface = {
		'cursor-theme': string;
		'cursor-size': number;
	};

	const COLLAPSED = 6;

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['cursor-theme', 'cursor-size']);

	let removing = $state<CursorTheme | null>(null);
	let problem = $state('');
	let expanded = $state(false);

	let current = $derived(desktop.values['cursor-theme'] ?? 'Adwaita');
	let themes = $derived(cursors.themes ?? []);
	let sizes = $derived(cursorSizes());
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
			await commands.appearanceCursorRemove({ name: theme.name });
			await cursors.load();
		} catch (reason) {
			problem = errorText(reason);
		}
	}

	void cursors.load();
</script>

<svelte:window onfocus={() => cursors.load()} />

<Section title={t('settings-cursors')}>
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
	<Row title={t('settings-cursors-size')}>
		<Select label={t('settings-cursors-size-label')} options={sizes} value={desktop.values['cursor-size'] ?? 24} onchange={(size) => desktop.set('cursor-size', size)} />
	</Row>
	<Row title={t('settings-cursors-get-more')} description={t('settings-cursors-get-more-description')} icon={Download} onclick={onbrowse} />
	<Row title={t('settings-cursors-folder')} description={t('settings-cursors-folder-description')} icon={FolderOpen} onclick={openCursorFolder} />
</Section>

{#if removing}
	{@const theme = removing}
	<Dialog title={t('settings-cursors-remove-title', { theme: theme.title })} description={t('settings-cursors-remove-description')} onclose={() => (removing = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>{t('settings-cursors-cancel')}</button>
			<button type="button" class="button danger" onclick={() => remove(theme)}>{t('settings-cursors-remove')}</button>
		{/snippet}
	</Dialog>
{/if}
