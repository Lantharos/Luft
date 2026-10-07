<script lang="ts">
	import { onDestroy } from 'svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { fileUrl } from '@lantharos/sabine';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { installedApps, type App } from '../../apps/api';
	import { loadDisplays, onDisplaysChanged, type Displays } from '../../display/api';
	import { thumbnail, uriToPath } from '../api';
	import { ALIGNMENTS, AUTO_HIDE, LOOKS, SIZES, STYLES, TASKBAR_KEYS, type TaskbarSettings } from './options';
	import TaskbarPreview from './TaskbarPreview.svelte';

	let { onclose }: { onclose: () => void } = $props();

	type Background = { 'picture-uri': string; 'picture-uri-dark': string };
	type Wallpapers = { 'live-wallpaper': string; 'live-wallpaper-dark': string };

	const PREVIEW_APPS = 5;
	const RUNNING_APPS = 2;

	const taskbar = useSettings<TaskbarSettings>('com.lantharos.kestrel', TASKBAR_KEYS);
	const wallpapers = useSettings<Wallpapers>('com.lantharos.kestrel', ['live-wallpaper', 'live-wallpaper-dark']);
	const background = useSettings<Background>('org.gnome.desktop.background', ['picture-uri', 'picture-uri-dark']);
	const desktop = useSettings<{ 'color-scheme': string }>('org.gnome.desktop.interface', ['color-scheme']);

	let installed = $state<App[]>([]);
	let displays = $state(1);
	let wallpaper = $state<string | null>(null);
	let opened = $state(false);

	let values = $derived(taskbar.values);
	let showPinned = $derived(values['taskbar-show-pinned'] ?? true);
	let everyDisplay = $derived((values['taskbar-displays'] ?? 'all') === 'all');
	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let wallpaperPath = $derived(
		uriToPath(
			(dark ? wallpapers.values['live-wallpaper-dark'] : wallpapers.values['live-wallpaper']) ||
				((dark ? background.values['picture-uri-dark'] : background.values['picture-uri']) ?? '')
		)
	);
	let previewApps = $derived.by(() => {
		const byId = new Map(installed.map((app) => [app.id, app]));
		const pinned = (values['favorite-apps'] ?? []).map((id) => byId.get(id)).filter((app) => app !== undefined);
		const apps = [...new Set([...pinned, ...installed])];
		return apps.slice(0, showPinned ? PREVIEW_APPS : RUNNING_APPS);
	});

	const receiveDisplays = (state: Displays) => (displays = state.logical.length);

	$effect(() => {
		void installedApps().then((apps) => (installed = apps));
	});

	$effect(() => {
		const path = wallpaperPath;
		if (!path) {
			wallpaper = null;
			return;
		}
		void thumbnail(path).then((thumb) => {
			if (path === wallpaperPath) wallpaper = fileUrl(thumb);
		});
	});

	void loadDisplays().then(receiveDisplays);
	onDestroy(onDisplaysChanged(receiveDisplays));
</script>

<SubPage title="Taskbar" back="Appearance" {onclose}>
	<TaskbarPreview
		{wallpaper}
		apps={previewApps}
		alignment={values['taskbar-alignment'] ?? 'center'}
		look={values['taskbar-look'] ?? 'glass'}
		style={values['taskbar-style'] ?? 'bar'}
		size={values['taskbar-size'] ?? 'normal'}
		autoHide={values['taskbar-auto-hide'] ?? 'never'}
	/>

	<Section>
		<Row title="Alignment">
			<Segmented label="Alignment" options={ALIGNMENTS} value={values['taskbar-alignment'] ?? 'center'} onchange={(value) => taskbar.set('taskbar-alignment', value)} />
		</Row>
		<Row title="Look">
			<Segmented label="Look" options={LOOKS} value={values['taskbar-look'] ?? 'glass'} onchange={(value) => taskbar.set('taskbar-look', value)} />
		</Row>
		<Row title="Shape">
			<Segmented label="Shape" options={STYLES} value={values['taskbar-style'] ?? 'bar'} onchange={(value) => taskbar.set('taskbar-style', value)} />
		</Row>
		<Row title="Size">
			<Segmented label="Size" options={SIZES} value={values['taskbar-size'] ?? 'normal'} onchange={(value) => taskbar.set('taskbar-size', value)} />
		</Row>
		<Row title="Hide automatically">
			<Select label="Hide automatically" options={AUTO_HIDE} value={values['taskbar-auto-hide'] ?? 'never'} onchange={(value) => taskbar.set('taskbar-auto-hide', value)} />
		</Row>
		<Row title="More options" expanded={opened} onclick={() => (opened = !opened)} />
		{#if opened}
			<Row title="Show pinned apps">
				<Switch label="Show pinned apps" checked={showPinned} onchange={(on) => taskbar.set('taskbar-show-pinned', on)} />
			</Row>
			{#if displays > 1}
				<Row title="Show on every display">
					<Switch label="Show on every display" checked={everyDisplay} onchange={(on) => taskbar.set('taskbar-displays', on ? 'all' : 'primary')} />
				</Row>
				{#if everyDisplay}
					<Row title="Only list windows on the same display">
						<Switch
							label="Only list windows on the same display"
							checked={values['taskbar-windows-per-display'] ?? false}
							onchange={(on) => taskbar.set('taskbar-windows-per-display', on)}
						/>
					</Row>
				{/if}
			{/if}
		{/if}
	</Section>
</SubPage>
