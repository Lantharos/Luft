<script lang="ts">
	import { t } from '@luft/i18n';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { onDestroy } from 'svelte';
	import { appearance, Row, Section, Segmented, tooltip } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { App, Displays } from '#lib/bindings.js';
	import Strip from '#lib/components/Strip.svelte';
	import RowValue from '#lib/components/RowValue.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import Swatches from '#lib/components/Swatches.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { currentWallpaper } from '../wallpaper/current.svelte';
	import MoreOptions from './MoreOptions.svelte';
	import { LOOKS, POSITIONS, SIZES, START_STYLES, STYLES, TASKBAR_KEYS, WEB_SEARCH, type Look, type TaskbarSettings } from './options';
	import StartOptions from './StartOptions.svelte';
	import TaskbarPreview from './TaskbarPreview.svelte';

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
	let position = $derived(values['taskbar-position'] ?? 'bottom');
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
	let page = $derived(t('settings-page-taskbar'));

	const receiveDisplays = (state: Displays) => (displays = state.logical.length);
	const open = (section: string | null) => (app.section = section);

	$effect(() => {
		void commands.appsInstalled().then((apps) => (installed = apps));
	});

	void commands.displayState().then(receiveDisplays);
	onDestroy(events.displayChanged(receiveDisplays));
</script>

{#if app.section === 'start'}
	<SubPage title={t('settings-start-section')} back={page} onclose={() => open(null)}>
		<StartOptions settings={taskbar} />
	</SubPage>
{:else if app.section === 'more'}
	<SubPage title={t('settings-taskbar-more')} back={page} onclose={() => open(null)}>
		<MoreOptions settings={taskbar} {displays} />
	</SubPage>
{:else}
	<section class="flex flex-col gap-5">
		<div class="relative overflow-hidden rounded-2xl">
			<TaskbarPreview
				wallpaper={wallpaper.url}
				apps={previewApps}
				{position}
				alignment={values['taskbar-alignment'] ?? 'center'}
				{look}
				style={values['taskbar-style'] ?? 'bar'}
				size={values['taskbar-size'] ?? 'normal'}
				autoHide={values['taskbar-auto-hide'] ?? 'never'}
				{shown}
				{startButton}
			/>
			{#if shown}
				{#each POSITIONS.filter((edge) => edge.value !== position) as edge (edge.value)}
					<button
						type="button"
						class="edge {edge.value}"
						aria-label={t(edge.label)}
						{@attach tooltip(t(edge.label))}
						onclick={() => taskbar.set('taskbar-position', edge.value)}
					>
						<span class="handle"></span>
					</button>
				{/each}
			{/if}
		</div>
		<Strip>
			<div>
				<span class="caption">{t('settings-taskbar-shape')}</span>
				<Segmented label={t('settings-taskbar-shape')} options={styles} value={values['taskbar-style'] ?? 'bar'} onchange={(value) => taskbar.set('taskbar-style', value)} />
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
	</section>

	<Section>
		<Row title={t('settings-start-section')} icon={LayoutGrid} onclick={() => open('start')}>
			<RowValue text={startSummary} />
		</Row>
		<Row title={t('settings-taskbar-more')} icon={SlidersHorizontal} onclick={() => open('more')}>
			{#if !shown}
				<RowValue text={t('settings-taskbar-hidden')} />
			{/if}
		</Row>
	</Section>
{/if}

<style>
	.edge {
		position: absolute;
		display: grid;
		place-items: center;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.edge:hover {
		background: color-mix(in oklab, white 22%, transparent);
	}

	.handle {
		width: 40px;
		height: 5px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.7);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
		transition:
			width var(--motion-tap) var(--ease-decelerate),
			background-color var(--motion-tap) var(--ease-decelerate);
	}

	.edge.left .handle,
	.edge.right .handle {
		width: 5px;
		height: 40px;
	}

	.edge:hover .handle {
		width: 64px;
		background: white;
	}

	.edge.left:hover .handle,
	.edge.right:hover .handle {
		width: 5px;
		height: 64px;
	}

	.edge.bottom,
	.edge.top {
		right: 0;
		left: 0;
		height: 26px;
	}

	.edge.bottom {
		bottom: 0;
	}

	.edge.top {
		top: 0;
	}

	.edge.left,
	.edge.right {
		top: 26px;
		bottom: 26px;
		width: 26px;
	}

	.edge.left {
		left: 0;
	}

	.edge.right {
		right: 0;
	}
</style>
