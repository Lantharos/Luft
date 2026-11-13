<script lang="ts">
	import ExtensionRows from '#lib/panels/personalization/extensions/ExtensionRows.svelte';
	import { t } from '@luft/i18n';
	import Image from '@lucide/svelte/icons/image';
	import Layers from '@lucide/svelte/icons/layers';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import MousePointer2 from '@lucide/svelte/icons/mouse-pointer-2';
	import Type from '@lucide/svelte/icons/type';
	import { appearance, Row, Section, Switch } from '@luft/ui';
	import RowValue from '#lib/components/RowValue.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { percent } from '#lib/format.js';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { wallpaperName } from '../wallpaper/current.svelte';
	import WallpaperPage from '../wallpaper/WallpaperPage.svelte';
	import AppIconsSection from './AppIconsSection.svelte';
	import { cursors } from './cursors/cursors.svelte';
	import CursorSection from './cursors/CursorSection.svelte';
	import CursorStore from './cursors/CursorStore.svelte';
	import FontsPage from './fonts/FontsPage.svelte';
	import FontsSection from './fonts/FontsSection.svelte';
	import { GLASS_SCHEMA, glassSummary, type Glass } from './glass.js';
	import GlassSection from './GlassSection.svelte';
	import { fontLibrary } from './fonts/library.svelte';
	import StyleSection from './StyleSection.svelte';

	type Kestrel = { 'app-icon-style': string; 'theme-apps': boolean };
	type Interface = { 'text-scaling-factor': number; 'cursor-theme': string };

	const WALLPAPER = 'wallpaper';
	const WALLPAPER_GROUP = 'wallpaper/';

	const GLASS_STYLES = {
		luca: 'settings-appearance-glass-luca',
		maris: 'settings-appearance-glass-maris',
		mixed: 'settings-appearance-glass-mixed'
	};

	const ICON_STYLES: Record<string, string> = {
		default: 'settings-appearance-icons-original',
		tinted: 'settings-appearance-icons-tinted',
		clear: 'settings-appearance-icons-clear'
	};

	const kestrel = useSettings<Kestrel>(KESTREL_SCHEMA, ['app-icon-style', 'theme-apps']);
	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'cursor-theme']);
	const glass = useSettings<Glass>(GLASS_SCHEMA, ['taskbar', 'surfaces', 'windows']);
	const wallpaper = wallpaperName();

	let font = $derived(appearance.typography.interface ?? fontLibrary.defaults?.interface ?? '');
	let text = $derived([font, percent(desktop.values['text-scaling-factor'] ?? 1)].filter(Boolean).join(', '));
	let cursorName = $derived(desktop.values['cursor-theme'] ?? '');
	let cursorTitle = $derived(cursors.themes?.find((theme) => theme.name === cursorName)?.title ?? cursorName.replace(/[-_]/g, ' '));

	if (!cursors.themes) void cursors.load();

	const open = (section: string | null) => (app.section = section);

	void fontLibrary.load();
</script>

{#if app.section === 'cursors'}
	<CursorStore onclose={() => open('cursor')} />
{:else if app.section === 'fonts'}
	<FontsPage onclose={() => open('text')} />
{:else if app.section === WALLPAPER || app.section?.startsWith(WALLPAPER_GROUP)}
	<WallpaperPage
		group={app.section.startsWith(WALLPAPER_GROUP) ? app.section.slice(WALLPAPER_GROUP.length) : null}
		onopen={(group) => open(group ? WALLPAPER_GROUP + group : WALLPAPER)}
		onclose={() => open(null)} />
{:else if app.section === 'icons'}
	<SubPage title={t('settings-appearance-icons')} onclose={() => open(null)}>
		<AppIconsSection />
		<Section>
			<Row title={t('settings-appearance-theme-apps')} description={t('settings-appearance-theme-apps-description')}>
				<Switch label={t('settings-appearance-theme-apps')} checked={kestrel.values['theme-apps'] ?? false} onchange={(on) => kestrel.set('theme-apps', on)} />
			</Row>
		</Section>
	</SubPage>
{:else if app.section === 'text'}
	<SubPage title={t('settings-appearance-text')} onclose={() => open(null)}>
		<FontsSection onbrowse={() => open('fonts')} />
	</SubPage>
{:else if app.section === 'glass'}
	<SubPage title={t('settings-appearance-glass')} onclose={() => open(null)}>
		<GlassSection />
	</SubPage>
{:else if app.section === 'cursor'}
	<SubPage title={t('settings-cursors')} onclose={() => open(null)}>
		<CursorSection onbrowse={() => open('cursors')} />
	</SubPage>
{:else}
	<StyleSection />

	<Section>
		<Row title={t('settings-appearance-wallpaper')} icon={Image} onclick={() => open(WALLPAPER)}>
			<RowValue text={wallpaper.name} />
		</Row>
		<Row title={t('settings-appearance-icons')} icon={LayoutGrid} onclick={() => open('icons')}>
			<RowValue text={t(ICON_STYLES[kestrel.values['app-icon-style'] ?? 'tinted'])} />
		</Row>
		<Row title={t('settings-appearance-glass')} icon={Layers} onclick={() => open('glass')}>
			<RowValue text={t(GLASS_STYLES[glassSummary(glass.values)])} />
		</Row>
		<Row title={t('settings-appearance-text')} icon={Type} onclick={() => open('text')}>
			<RowValue {text} />
		</Row>
		<Row title={t('settings-cursors')} icon={MousePointer2} onclick={() => open('cursor')}>
			<RowValue text={cursorTitle} />
		</Row>
	</Section>

	<ExtensionRows page="appearance" />
{/if}
