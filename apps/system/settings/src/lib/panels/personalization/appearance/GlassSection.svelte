<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { GLASS_SCHEMA, type Glass, type GlassKind, type GlassStyle } from './glass.js';

	const glass = useSettings<Glass>(GLASS_SCHEMA, ['taskbar', 'surfaces', 'windows', 'luca-blurs', 'wallpaper-on-power-saver']);

	let styles = $derived<{ value: GlassStyle; label: string }[]>([
		{ value: 'luca', label: t('settings-appearance-glass-luca') },
		{ value: 'maris', label: t('settings-appearance-glass-maris') }
	]);
	let kinds = $derived<{ key: GlassKind; title: string }[]>([
		{ key: 'taskbar', title: t('settings-appearance-glass-taskbar') },
		{ key: 'surfaces', title: t('settings-appearance-glass-surfaces') },
		{ key: 'windows', title: t('settings-appearance-glass-windows') }
	]);
</script>

<Section>
	{#each kinds as kind (kind.key)}
		<Row title={kind.title}>
			<Segmented label={kind.title} options={styles} value={glass.values[kind.key] ?? 'luca'} onchange={(style) => glass.set(kind.key, style)} />
		</Row>
	{/each}
</Section>

<Section>
	<Row title={t('settings-appearance-glass-blurs')}>
		<Switch
			label={t('settings-appearance-glass-blurs')}
			checked={glass.values['luca-blurs'] === 'wallpaper'}
			onchange={(on) => glass.set('luca-blurs', on ? 'wallpaper' : 'everything')} />
	</Row>
	<Row title={t('settings-appearance-glass-power-saver')}>
		<Switch
			label={t('settings-appearance-glass-power-saver')}
			checked={glass.values['wallpaper-on-power-saver'] ?? true}
			onchange={(on) => glass.set('wallpaper-on-power-saver', on)} />
	</Row>
</Section>
