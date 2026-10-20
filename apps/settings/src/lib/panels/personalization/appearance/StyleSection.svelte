<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, Row, Section, Segmented, Switch } from '@luft/ui';
	import Swatches from '#lib/components/Swatches.svelte';
	import TimePicker from '#lib/components/TimePicker.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	type Schedule = 'off' | 'sunset' | 'custom';
	type Accent = 'wallpaper' | 'white';
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
		'theme-apps': boolean;
	};

	const SCHEDULE_NOTES: Record<Schedule, string | undefined> = {
		off: undefined,
		sunset: 'settings-appearance-schedule-sunset-description',
		custom: 'settings-appearance-schedule-custom-description'
	};

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['color-scheme', 'clock-format']);
	const kestrel = useSettings<Kestrel>('com.lantharos.kestrel', ['accent', 'dark-schedule', 'dark-schedule-from', 'dark-schedule-to', 'pure-black', 'theme-apps']);

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let schedule = $derived(kestrel.values['dark-schedule'] ?? 'off');
	let twelveHour = $derived(desktop.values['clock-format'] === '12h');
	let accent = $derived(kestrel.values.accent ?? 'wallpaper');
	let schedules = $derived<{ value: Schedule; label: string }[]>([
		{ value: 'off', label: t('settings-appearance-schedule-off') },
		{ value: 'sunset', label: t('settings-appearance-schedule-sunset') },
		{ value: 'custom', label: t('settings-appearance-schedule-custom') }
	]);
	let scheduleNote = $derived(SCHEDULE_NOTES[schedule]);
	let accents = $derived<{ value: Accent; label: string; color: string }[]>([
		{ value: 'wallpaper', label: t('settings-appearance-accent-wallpaper'), color: appearance.wallpaperAccent ?? 'var(--accent)' },
		{ value: 'white', label: t('settings-appearance-accent-white'), color: '#ffffff' }
	]);
</script>

<Section title={t('settings-appearance-style')}>
	<Row title={t('settings-appearance-style-title')} description={t('settings-appearance-style-description')}>
		<Segmented
			label={t('settings-appearance-style')}
			options={[
				{ value: 'light', label: t('settings-appearance-style-light') },
				{ value: 'dark', label: t('settings-appearance-style-dark') }
			]}
			value={dark ? 'dark' : 'light'}
			onchange={(style) => desktop.set('color-scheme', style === 'dark' ? 'prefer-dark' : 'default')}
		/>
	</Row>
	<Row
		title={t('settings-appearance-schedule')}
		description={scheduleNote && t(scheduleNote)}
	>
		<Segmented label={t('settings-appearance-schedule')} options={schedules} value={schedule} onchange={(value) => kestrel.set('dark-schedule', value)} />
	</Row>
	{#if schedule === 'custom'}
		<Row title={t('settings-appearance-dark-from')}>
			<TimePicker label={t('settings-appearance-dark-from')} {twelveHour} value={kestrel.values['dark-schedule-from'] ?? 20} onchange={(hours) => kestrel.set('dark-schedule-from', hours)} />
		</Row>
		<Row title={t('settings-appearance-light-from')}>
			<TimePicker label={t('settings-appearance-light-from')} {twelveHour} value={kestrel.values['dark-schedule-to'] ?? 7} onchange={(hours) => kestrel.set('dark-schedule-to', hours)} />
		</Row>
	{/if}
	<Row title={t('settings-appearance-pure-black')} description={t('settings-appearance-pure-black-description')}>
		<Switch label={t('settings-appearance-pure-black')} checked={kestrel.values['pure-black'] ?? false} onchange={(on) => kestrel.set('pure-black', on)} />
	</Row>
	<Row
		title={t('settings-appearance-accent')}
		description={accent === 'white' ? t('settings-appearance-accent-white-description') : t('settings-appearance-accent-wallpaper-description')}
	>
		<Swatches label={t('settings-appearance-accent')} options={accents} value={accent} onchange={(value) => kestrel.set('accent', value)} />
	</Row>
	<Row title={t('settings-appearance-theme-apps')} description={t('settings-appearance-theme-apps-description')}>
		<Switch label={t('settings-appearance-theme-apps')} checked={kestrel.values['theme-apps'] ?? false} onchange={(on) => kestrel.set('theme-apps', on)} />
	</Row>
</Section>
