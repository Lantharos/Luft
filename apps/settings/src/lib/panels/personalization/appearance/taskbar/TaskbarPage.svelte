<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { installedApps, type App } from '../../../system/apps/api';
	import { loadDisplays, onDisplaysChanged, type Displays } from '../../../devices/display/api';
	import { currentWallpaper } from '../wallpaper/current.svelte';
	import { ALIGNMENTS, AUTO_HIDE, LOOKS, SIZES, START_STYLES, STYLES, TASKBAR_KEYS, WEB_SEARCH, type TaskbarSettings } from './options';
	import TaskbarPreview from './TaskbarPreview.svelte';

	let { onclose }: { onclose: () => void } = $props();

	const PREVIEW_APPS = 5;
	const RUNNING_APPS = 2;

	const taskbar = useSettings<TaskbarSettings>('com.lantharos.kestrel', TASKBAR_KEYS);
	const wallpaper = currentWallpaper();

	let installed = $state<App[]>([]);
	let displays = $state(1);
	let opened = $state(false);

	let values = $derived(taskbar.values);
	let showPinned = $derived(values['taskbar-show-pinned'] ?? true);
	let shown = $derived(values['taskbar-shown'] ?? true);
	let startButton = $derived(values['taskbar-start-button'] ?? true);
	let startStyle = $derived(values['start-style'] ?? 'menu');
	let everyDisplay = $derived((values['taskbar-displays'] ?? 'all') === 'all');
	let previewApps = $derived.by(() => {
		const byId = new Map(installed.map((app) => [app.id, app]));
		const pinned = (values['favorite-apps'] ?? []).map((id) => byId.get(id)).filter((app) => app !== undefined);
		const apps = [...new Set([...pinned, ...installed])];
		return apps.slice(0, showPinned ? PREVIEW_APPS : RUNNING_APPS);
	});

	function translated<T>(options: { value: T; label: string }[]) {
		return options.map((option) => ({ value: option.value, label: t(option.label) }));
	}

	let alignments = $derived(translated(ALIGNMENTS));
	let looks = $derived(translated(LOOKS));
	let styles = $derived(translated(STYLES));
	let sizes = $derived(translated(SIZES));
	let autoHide = $derived(translated(AUTO_HIDE));
	let startStyles = $derived(translated(START_STYLES));

	const receiveDisplays = (state: Displays) => (displays = state.logical.length);

	$effect(() => {
		void installedApps().then((apps) => (installed = apps));
	});

	void loadDisplays().then(receiveDisplays);
	onDestroy(onDisplaysChanged(receiveDisplays));
</script>

<SubPage title={t('settings-taskbar-title')} back={t('settings-taskbar-back')} {onclose}>
	<TaskbarPreview
		wallpaper={wallpaper.url}
		apps={previewApps}
		alignment={values['taskbar-alignment'] ?? 'center'}
		look={values['taskbar-look'] ?? 'glass'}
		style={values['taskbar-style'] ?? 'bar'}
		size={values['taskbar-size'] ?? 'normal'}
		autoHide={values['taskbar-auto-hide'] ?? 'never'}
		{shown}
		{startButton}
	/>

	<Section title={t('settings-start-section')}>
		<Row
			title={t('settings-start-style')}
			description={t(startStyle === 'palette' ? 'settings-start-style-palette-description' : 'settings-start-style-menu-description')}
		>
			<Segmented label={t('settings-start-style')} options={startStyles} value={startStyle} onchange={(value) => taskbar.set('start-style', value)} />
		</Row>
		<Row title={t('settings-start-button')} description={t('settings-start-button-description')}>
			<Switch label={t('settings-start-button')} checked={startButton} onchange={(on) => taskbar.set('taskbar-start-button', on)} />
		</Row>
		<Row title={t('settings-start-web')}>
			<Select
				label={t('settings-start-web')}
				options={WEB_SEARCH}
				value={values['search-web-engine'] ?? 'duckduckgo'}
				onchange={(value) => taskbar.set('search-web-engine', value)}
			/>
		</Row>
	</Section>

	<Section title={t('settings-taskbar-section')}>
		<Row title={t('settings-taskbar-shown')} description={shown ? undefined : t('settings-taskbar-hidden-description')}>
			<Switch label={t('settings-taskbar-shown')} checked={shown} onchange={(on) => taskbar.set('taskbar-shown', on)} />
		</Row>
		{#if shown}
			<Row title={t('settings-taskbar-alignment')}>
				<Segmented label={t('settings-taskbar-alignment')} options={alignments} value={values['taskbar-alignment'] ?? 'center'} onchange={(value) => taskbar.set('taskbar-alignment', value)} />
			</Row>
			<Row title={t('settings-taskbar-look')}>
				<Segmented label={t('settings-taskbar-look')} options={looks} value={values['taskbar-look'] ?? 'glass'} onchange={(value) => taskbar.set('taskbar-look', value)} />
			</Row>
			<Row title={t('settings-taskbar-shape')}>
				<Segmented label={t('settings-taskbar-shape')} options={styles} value={values['taskbar-style'] ?? 'bar'} onchange={(value) => taskbar.set('taskbar-style', value)} />
			</Row>
			<Row title={t('settings-taskbar-size')}>
				<Segmented label={t('settings-taskbar-size')} options={sizes} value={values['taskbar-size'] ?? 'normal'} onchange={(value) => taskbar.set('taskbar-size', value)} />
			</Row>
			<Row title={t('settings-taskbar-auto-hide')}>
				<Select label={t('settings-taskbar-auto-hide')} options={autoHide} value={values['taskbar-auto-hide'] ?? 'never'} onchange={(value) => taskbar.set('taskbar-auto-hide', value)} />
			</Row>
			<Row title={t('settings-taskbar-more')} expanded={opened} onclick={() => (opened = !opened)} />
			{#if opened}
				<Row title={t('settings-taskbar-show-pinned')}>
					<Switch label={t('settings-taskbar-show-pinned')} checked={showPinned} onchange={(on) => taskbar.set('taskbar-show-pinned', on)} />
				</Row>
				<Row title={t('settings-taskbar-per-workspace')}>
					<Switch
						label={t('settings-taskbar-per-workspace')}
						checked={values['taskbar-windows-per-workspace'] ?? false}
						onchange={(on) => taskbar.set('taskbar-windows-per-workspace', on)}
					/>
				</Row>
				{#if displays > 1}
					<Row title={t('settings-taskbar-every-display')}>
						<Switch label={t('settings-taskbar-every-display')} checked={everyDisplay} onchange={(on) => taskbar.set('taskbar-displays', on ? 'all' : 'primary')} />
					</Row>
					{#if everyDisplay}
						<Row title={t('settings-taskbar-per-display')}>
							<Switch
								label={t('settings-taskbar-per-display')}
								checked={values['taskbar-windows-per-display'] ?? false}
								onchange={(on) => taskbar.set('taskbar-windows-per-display', on)}
							/>
						</Row>
					{/if}
				{/if}
			{/if}
		{/if}
	</Section>
</SubPage>
