<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, Segmented, Switch } from '@luft/ui';
	import Stage from '#lib/components/Stage.svelte';
	import Strip from '#lib/components/Strip.svelte';
	import Swatches from '#lib/components/Swatches.svelte';
	import TimePicker from '#lib/components/TimePicker.svelte';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { currentWallpaper } from '../wallpaper/current.svelte';
	import CornerGlyph from './CornerGlyph.svelte';
	import MiniDesktop from './MiniDesktop.svelte';

	type Mode = 'light' | 'dark' | 'auto';
	type Schedule = 'off' | 'sunset' | 'custom';
	type Accent = 'wallpaper' | 'white';
	type Corners = 'rounded' | 'square';
	type Interface = {
		'color-scheme': string;
		'clock-format': string;
	};
	type Kestrel = {
		accent: Accent;
		'dark-schedule': Schedule;
		'dark-schedule-from': number;
		'dark-schedule-to': number;
		'pure-black': boolean;
		'rounded-window-corners': boolean;
	};

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['color-scheme', 'clock-format']);
	const kestrel = useSettings<Kestrel>(KESTREL_SCHEMA, ['accent', 'dark-schedule', 'dark-schedule-from', 'dark-schedule-to', 'pure-black', 'rounded-window-corners']);
	const wallpaper = currentWallpaper();

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let schedule = $derived(kestrel.values['dark-schedule'] ?? 'off');
	let mode = $derived<Mode>(schedule !== 'off' ? 'auto' : dark ? 'dark' : 'light');
	let twelveHour = $derived(desktop.values['clock-format'] === '12h');
	let corners = $derived<Corners>((kestrel.values['rounded-window-corners'] ?? true) ? 'rounded' : 'square');
	let modes = $derived<{ value: Mode; label: string }[]>([
		{ value: 'light', label: t('settings-appearance-style-light') },
		{ value: 'dark', label: t('settings-appearance-style-dark') },
		{ value: 'auto', label: t('settings-appearance-style-auto') }
	]);
	let schedules = $derived<{ value: Schedule; label: string }[]>([
		{ value: 'sunset', label: t('settings-appearance-schedule-sunset') },
		{ value: 'custom', label: t('settings-appearance-schedule-custom') }
	]);
	let accents = $derived<{ value: Accent; label: string; color: string }[]>([
		{ value: 'wallpaper', label: t('settings-appearance-accent-wallpaper'), color: appearance.wallpaperAccent ?? 'var(--accent)' },
		{ value: 'white', label: t('settings-appearance-accent-white'), color: '#ffffff' }
	]);
	let cornerOptions = $derived<{ value: Corners; label: string }[]>([
		{ value: 'rounded', label: t('settings-appearance-corners-rounded') },
		{ value: 'square', label: t('settings-appearance-corners-square') }
	]);

	function choose(next: Mode) {
		if (next === 'auto') {
			if (schedule === 'off') kestrel.set('dark-schedule', 'sunset');
			return;
		}
		kestrel.set('dark-schedule', 'off');
		desktop.set('color-scheme', next === 'dark' ? 'prefer-dark' : 'default');
	}
</script>

<section class="flex flex-col gap-5">
	<Stage>
		<MiniDesktop wallpaper={wallpaper.url} scheme={dark ? 'dark' : 'light'} rounded={corners === 'rounded'} />
	</Stage>
	<Strip>
		<div>
			<span class="caption">{t('settings-appearance-style')}</span>
			<Segmented label={t('settings-appearance-style')} options={modes} value={mode} onchange={choose} />
		</div>
		<div>
			<span class="caption">{t('settings-appearance-accent')}</span>
			<span class="flex h-10 items-center">
				<Swatches label={t('settings-appearance-accent')} options={accents} value={kestrel.values.accent ?? 'wallpaper'} onchange={(value) => kestrel.set('accent', value)} />
			</span>
		</div>
		<div>
			<span class="caption">{t('settings-appearance-corners')}</span>
			<Segmented label={t('settings-appearance-corners')} options={cornerOptions} value={corners} onchange={(value) => kestrel.set('rounded-window-corners', value === 'rounded')}>
				{#snippet item(option)}
					<CornerGlyph rounded={option.value === 'rounded'} />
				{/snippet}
			</Segmented>
		</div>
	</Strip>
	{#if mode === 'auto'}
		<div class="context">
			<Segmented label={t('settings-appearance-schedule')} options={schedules} value={schedule === 'custom' ? 'custom' : 'sunset'} onchange={(value) => kestrel.set('dark-schedule', value)} />
			{#if schedule === 'custom'}
				<span>{t('settings-appearance-dark-from')}</span>
				<TimePicker label={t('settings-appearance-dark-from')} {twelveHour} value={kestrel.values['dark-schedule-from'] ?? 20} onchange={(hours) => kestrel.set('dark-schedule-from', hours)} />
				<span>{t('settings-appearance-light-from')}</span>
				<TimePicker label={t('settings-appearance-light-from')} {twelveHour} value={kestrel.values['dark-schedule-to'] ?? 7} onchange={(hours) => kestrel.set('dark-schedule-to', hours)} />
			{/if}
		</div>
	{:else if mode === 'dark'}
		<div class="context">
			<span>{t('settings-appearance-pure-black')}</span>
			<Switch label={t('settings-appearance-pure-black')} checked={kestrel.values['pure-black'] ?? false} onchange={(on) => kestrel.set('pure-black', on)} />
		</div>
	{/if}
</section>

<style>
	.context {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 14px;
		padding: 0 6px;
		font-size: 14px;
		color: var(--text-soft);
	}
</style>
