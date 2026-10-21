<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { currentWallpaper } from '../../appearance/wallpaper/current.svelte';
	import { GAPS, LAYOUTS, MODES, NEW_WINDOWS, TILING_KEYS, type TilingSettings } from './options';
	import TilingPreview from './TilingPreview.svelte';

	const tiling = useSettings<TilingSettings>(KESTREL_SCHEMA, TILING_KEYS);
	const wallpaper = currentWallpaper();

	let mode = $derived(tiling.values['window-tiling'] ?? 'off');
	let layout = $derived(tiling.values['tiling-layout'] ?? 'dwindle');
	let gaps = $derived(tiling.values['tiling-gaps'] ?? 'medium');

	function translated<T>(options: { value: T; label: string }[]) {
		return options.map((option) => ({ value: option.value, label: t(option.label) }));
	}

	let modes = $derived(translated(MODES));
	let layouts = $derived(translated(LAYOUTS));
	let gapOptions = $derived(translated(GAPS));
	let newWindows = $derived(translated(NEW_WINDOWS));
</script>

<Section title={t('settings-tiling-title')}>
	<TilingPreview wallpaper={wallpaper.url} {mode} {layout} gap={GAPS.find((option) => option.value === gaps)!.pixels} />
	<Row title={t('settings-tiling-mode')} description={t(MODES.find((option) => option.value === mode)!.description)}>
		<Segmented label={t('settings-tiling-mode')} options={modes} value={mode} onchange={(value) => tiling.set('window-tiling', value)} />
	</Row>
	{#if mode === 'tiling'}
		<Row title={t('settings-tiling-layout')} description={t(layout === 'master' ? 'settings-tiling-layout-master-description' : 'settings-tiling-layout-dwindle-description')}>
			<Segmented label={t('settings-tiling-layout')} options={layouts} value={layout} onchange={(value) => tiling.set('tiling-layout', value)} />
		</Row>
	{/if}
	{#if mode !== 'off'}
		<Row title={t('settings-tiling-gaps')}>
			<Segmented label={t('settings-tiling-gaps')} options={gapOptions} value={gaps} onchange={(value) => tiling.set('tiling-gaps', value)} />
		</Row>
		<Row title={t('settings-tiling-new-windows')}>
			<Select
				label={t('settings-tiling-new-windows')}
				options={newWindows}
				value={tiling.values['tiling-new-windows'] ?? 'beside-focused'}
				onchange={(value) => tiling.set('tiling-new-windows', value)}
			/>
		</Row>
		<Row title={t('settings-tiling-shortcuts')} description={t('settings-tiling-shortcuts-description')} onclick={() => app.open('input/shortcuts')} />
	{/if}
</Section>
