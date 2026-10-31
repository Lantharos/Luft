<script lang="ts">
	import { t } from '@luft/i18n';
	import Image from '@lucide/svelte/icons/image';
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
	import WallpaperPanel from '../wallpaper/WallpaperPanel.svelte';
	import AppIconsSection from './AppIconsSection.svelte';
	import CursorSection from './cursors/CursorSection.svelte';
	import CursorStore from './cursors/CursorStore.svelte';
	import FontsPage from './fonts/FontsPage.svelte';
	import FontsSection from './fonts/FontsSection.svelte';
	import { fontLibrary } from './fonts/library.svelte';
	import StyleSection from './StyleSection.svelte';

	type Kestrel = { 'app-icon-style': string; 'theme-apps': boolean };
	type Interface = { 'text-scaling-factor': number; 'cursor-theme': string };

	const ICON_STYLES: Record<string, string> = {
		default: 'settings-appearance-icons-original',
		tinted: 'settings-appearance-icons-tinted',
		clear: 'settings-appearance-icons-clear'
	};

	const kestrel = useSettings<Kestrel>(KESTREL_SCHEMA, ['app-icon-style', 'theme-apps']);
	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'cursor-theme']);
	const wallpaper = wallpaperName();

	let font = $derived(appearance.typography.interface ?? fontLibrary.defaults?.interface ?? '');
	let text = $derived([font, percent(desktop.values['text-scaling-factor'] ?? 1)].filter(Boolean).join(', '));
	let page = $derived(t('settings-page-appearance'));

	const open = (section: string | null) => (app.section = section);

	void fontLibrary.load();
</script>

{#if app.section === 'cursors'}
	<CursorStore onclose={() => open('cursor')} />
{:else if app.section === 'fonts'}
	<FontsPage onclose={() => open('text')} />
{:else if app.section === 'wallpaper'}
	<SubPage title={t('settings-appearance-wallpaper')} back={page} onclose={() => open(null)}>
		<WallpaperPanel />
	</SubPage>
{:else if app.section === 'icons'}
	<SubPage title={t('settings-appearance-icons')} back={page} onclose={() => open(null)}>
		<AppIconsSection />
		<Section>
			<Row title={t('settings-appearance-theme-apps')} description={t('settings-appearance-theme-apps-description')}>
				<Switch label={t('settings-appearance-theme-apps')} checked={kestrel.values['theme-apps'] ?? false} onchange={(on) => kestrel.set('theme-apps', on)} />
			</Row>
		</Section>
	</SubPage>
{:else if app.section === 'text'}
	<SubPage title={t('settings-appearance-text')} back={page} onclose={() => open(null)}>
		<FontsSection onbrowse={() => open('fonts')} />
	</SubPage>
{:else if app.section === 'cursor'}
	<SubPage title={t('settings-cursors')} back={page} onclose={() => open(null)}>
		<CursorSection onbrowse={() => open('cursors')} />
	</SubPage>
{:else}
	<StyleSection />

	<Section>
		<Row title={t('settings-appearance-wallpaper')} icon={Image} onclick={() => open('wallpaper')}>
			<RowValue text={wallpaper.name} />
		</Row>
		<Row title={t('settings-appearance-icons')} icon={LayoutGrid} onclick={() => open('icons')}>
			<RowValue text={t(ICON_STYLES[kestrel.values['app-icon-style'] ?? 'tinted'])} />
		</Row>
		<Row title={t('settings-appearance-text')} icon={Type} onclick={() => open('text')}>
			<RowValue {text} />
		</Row>
		<Row title={t('settings-cursors')} icon={MousePointer2} onclick={() => open('cursor')}>
			<RowValue text={desktop.values['cursor-theme'] ?? 'Adwaita'} />
		</Row>
	</Section>
{/if}
