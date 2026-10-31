<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import PreviewCard from '#lib/components/PreviewCard.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { currentWallpaper } from '../wallpaper/current.svelte';
	import { GAPS, LAYOUTS, MODES, NEW_WINDOWS, TILING_KEYS, type TilingSettings } from './options';
	import TilingPreview from './TilingPreview.svelte';

	const tiling = useSettings<TilingSettings>(KESTREL_SCHEMA, TILING_KEYS);
	const board = useSettings<{ board: boolean }>(KESTREL_SCHEMA, ['board']);
	const wallpaper = currentWallpaper();

	let mode = $derived(tiling.values['window-tiling'] ?? 'off');
	let layout = $derived(tiling.values['tiling-layout'] ?? 'dwindle');
	let gaps = $derived(tiling.values['tiling-gaps'] ?? 'medium');
	let gap = $derived(GAPS.find((option) => option.value === gaps)!.pixels);

	function translated<T>(options: { value: T; label: string }[]) {
		return options.map((option) => ({ value: option.value, label: t(option.label) }));
	}

	let gapOptions = $derived(translated(GAPS));
	let newWindows = $derived(translated(NEW_WINDOWS));
</script>

<Section title={t('settings-tiling-mode')}>
	<div class="cards three" role="radiogroup" aria-label={t('settings-tiling-mode')}>
		{#each MODES as option (option.value)}
			<PreviewCard label={t(option.label)} description={t(option.description)} selected={mode === option.value} onclick={() => tiling.set('window-tiling', option.value)}>
				<TilingPreview wallpaper={wallpaper.url} mode={option.value} {layout} {gap} />
			</PreviewCard>
		{/each}
	</div>
</Section>

{#if mode === 'tiling'}
	<Section title={t('settings-tiling-layout')}>
		<div class="cards two" role="radiogroup" aria-label={t('settings-tiling-layout')}>
			{#each LAYOUTS as option (option.value)}
				<PreviewCard label={t(option.label)} selected={layout === option.value} onclick={() => tiling.set('tiling-layout', option.value)}>
					<TilingPreview wallpaper={wallpaper.url} mode="tiling" layout={option.value} {gap} />
				</PreviewCard>
			{/each}
		</div>
	</Section>
{/if}

{#if mode !== 'off'}
	<Section>
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
	</Section>
{/if}

<Section>
	<Row title={t('settings-board')} description={t('settings-board-description')}>
		<Switch label={t('settings-board')} checked={board.values.board ?? true} onchange={(on) => board.set('board', on)} />
	</Row>
</Section>

<style>
	.cards {
		display: grid;
		gap: 6px;
		padding: 6px;
	}

	.cards.three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.cards.two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		max-width: 66%;
	}
</style>
