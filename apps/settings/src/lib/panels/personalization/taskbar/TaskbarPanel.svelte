<script lang="ts">
	import ExtensionRows from '#lib/panels/personalization/extensions/ExtensionRows.svelte';
	import { t } from '@luft/i18n';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import Move from '@lucide/svelte/icons/move';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { onDestroy } from 'svelte';
	import { appearance, Row, Section, Segmented } from '@luft/ui';
	import {
		BUILT_IN_ELEMENTS,
		completeArrangement,
		parseArrangement,
		presetArrangement,
		PRESETS as ARRANGEMENTS,
		sameArrangement,
		storeArrangement,
		type Arrangement,
		type PresetName
	} from '@luft/ui/taskbar';
	import { commands, events } from '#lib/bindings.js';
	import type { App, Displays } from '#lib/bindings.js';
	import Strip from '#lib/components/Strip.svelte';
	import RowValue from '#lib/components/RowValue.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import Swatches from '#lib/components/Swatches.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { extensions } from '../extensions/extensions.svelte';
	import { currentWallpaper } from '../wallpaper/current.svelte';
	import MoreOptions from './MoreOptions.svelte';
	import { LOOKS, SIZES, START_STYLES, STYLES, TASKBAR_KEYS, WEB_SEARCH, type Look, type TaskbarSettings } from './options';
	import Presets from './Presets.svelte';
	import StartOptions from './StartOptions.svelte';
	import TaskbarPreview from './preview/TaskbarPreview.svelte';

	const PREVIEW_APPS = 5;
	const RUNNING_APPS = 2;

	const taskbar = useSettings<TaskbarSettings>(KESTREL_SCHEMA, TASKBAR_KEYS);
	const wallpaper = currentWallpaper();

	let installed = $state<App[]>([]);
	let displays = $state(1);

	let values = $derived(taskbar.values);
	let showPinned = $derived(values['taskbar-show-pinned'] ?? true);
	let shown = $derived(values['taskbar-shown'] ?? true);
	let startButton = $derived(values['taskbar-start-button'] ?? true);
	let look = $derived(values['taskbar-look'] ?? 'glass');
	let previewApps = $derived.by(() => {
		const byId = new Map(installed.map((app) => [app.id, app]));
		const pinned = (values['favorite-apps'] ?? []).map((id) => byId.get(id)).filter((app) => app !== undefined);
		const apps = [...new Set([...pinned, ...installed])];
		return apps.slice(0, showPinned ? PREVIEW_APPS : RUNNING_APPS);
	});

	function translated<T>(options: { value: T; label: string }[]) {
		return options.map((option) => ({ value: option.value, label: t(option.label) }));
	}

	const extensionOf = (element: string) => extensions.find(element.slice(0, element.indexOf('/')));
	let running = $derived((extensions.list ?? []).filter((extension) => extension.state === 'running'));
	let arrangement = $derived(
		completeArrangement(parseArrangement(values['taskbar-arrangement'] ?? storeArrangement(ARRANGEMENTS.centered.arrangement)), BUILT_IN_ELEMENTS)
	);
	let style = $derived(values['taskbar-style'] ?? 'bar');
	let preset = $derived(
		(Object.keys(ARRANGEMENTS) as PresetName[]).find(
			(name) => sameArrangement(presetArrangement(name, arrangement), arrangement) && (ARRANGEMENTS[name].style ?? style) === style
		) ?? null
	);

	const present = (element: string) =>
		element === 'start' ? startButton : BUILT_IN_ELEMENTS.includes(element) || running.some((extension) => element.startsWith(`${extension.id}/`));
	const label = (element: string) => {
		const names: Record<string, string> = {
			start: t('settings-taskbar-element-start'),
			dock: t('settings-taskbar-element-dock'),
			tray: t('settings-taskbar-element-tray'),
			status: t('settings-taskbar-element-status'),
			clock: t('settings-taskbar-element-clock')
		};
		return names[element] ?? extensionOf(element)?.name ?? element;
	};
	const arrange = (next: Arrangement) => taskbar.set('taskbar-arrangement', storeArrangement(next));
	const applyPreset = (name: PresetName) => {
		const { style: shape } = ARRANGEMENTS[name];
		if (shape) void taskbar.set('taskbar-style', shape);
		void arrange(presetArrangement(name, arrangement));
	};

	let styles = $derived(translated(STYLES));
	let sizes = $derived(translated(SIZES));
	let looks = $derived(
		LOOKS.map((option) => {
			const surface = appearance.taskbar?.[option.value]?.surface ?? 'transparent';
			const behind = wallpaper.url ? `center / cover url("${wallpaper.url}")` : 'var(--control)';
			return { value: option.value, label: t(option.label), color: `linear-gradient(${surface}, ${surface}), ${behind}` };
		})
	);
	let startSummary = $derived(
		[t(START_STYLES.find((option) => option.value === (values['start-style'] ?? 'menu'))!.label), WEB_SEARCH.find((option) => option.value === (values['search-web-engine'] ?? 'duckduckgo'))!.label].join(', ')
	);

	const receiveDisplays = (state: Displays) => (displays = state.logical.length);
	const open = (section: string | null) => (app.section = section);

	$effect(() => {
		void commands.appsInstalled().then((apps) => (installed = apps));
	});

	void extensions.load();

	void commands.displayState().then(receiveDisplays);
	onDestroy(events.displayChanged(receiveDisplays));
</script>

{#if app.section === 'start'}
	<SubPage title={t('settings-start-section')} onclose={() => open(null)}>
		<StartOptions settings={taskbar} />
	</SubPage>
{:else if app.section === 'more'}
	<SubPage title={t('settings-taskbar-more')} onclose={() => open(null)}>
		<MoreOptions settings={taskbar} {displays} />
	</SubPage>
{:else}
	<section class="flex flex-col gap-5">
		<TaskbarPreview
			wallpaper={wallpaper.url}
			apps={previewApps}
			{arrangement}
			{look}
			{style}
			size={values['taskbar-size'] ?? 'normal'}
			autoHide={values['taskbar-auto-hide'] ?? 'never'}
			{shown}
			{present}
			{label}
			onarrange={arrange}
		/>
		<Strip>
			<div>
				<span class="caption">{t('settings-taskbar-shape')}</span>
				<Segmented label={t('settings-taskbar-shape')} options={styles} value={style} onchange={(value) => taskbar.set('taskbar-style', value)} />
			</div>
			<div>
				<span class="caption">{t('settings-taskbar-look')}</span>
				<span class="flex h-10 items-center">
					<Swatches label={t('settings-taskbar-look')} options={looks} value={look} onchange={(value: Look) => taskbar.set('taskbar-look', value)} />
				</span>
			</div>
			<div>
				<span class="caption">{t('settings-taskbar-size')}</span>
				<Segmented label={t('settings-taskbar-size')} options={sizes} value={values['taskbar-size'] ?? 'normal'} onchange={(value) => taskbar.set('taskbar-size', value)} />
			</div>
		</Strip>
		<Strip>
			<div>
				<span class="caption">{t('settings-taskbar-presets')}</span>
				<Presets current={preset} onselect={applyPreset} />
			</div>
		</Strip>
	</section>

	<Section>
		{#if shown}
			<Row title={t('settings-taskbar-edit')} description={t('settings-taskbar-edit-description')} icon={Move} onclick={() => commands.taskbarArrange()} />
		{/if}
		<Row title={t('settings-start-section')} icon={LayoutGrid} onclick={() => open('start')}>
			<RowValue text={startSummary} />
		</Row>
		<Row title={t('settings-taskbar-more')} icon={SlidersHorizontal} onclick={() => open('more')}>
			{#if !shown}
				<RowValue text={t('settings-taskbar-hidden')} />
			{/if}
		</Row>
	</Section>

	<ExtensionRows page="taskbar" />
{/if}
