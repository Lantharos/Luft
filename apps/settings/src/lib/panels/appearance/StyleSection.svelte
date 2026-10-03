<script lang="ts">
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

	const SCHEDULES: { value: Schedule; label: string }[] = [
		{ value: 'off', label: 'Off' },
		{ value: 'sunset', label: 'Sunset to sunrise' },
		{ value: 'custom', label: 'Custom' }
	];

	const SCHEDULE_NOTES: Record<Schedule, string | undefined> = {
		off: undefined,
		sunset: 'Follows sunset and sunrise where you are',
		custom: 'Picking a style lasts until the next switch'
	};

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['color-scheme', 'clock-format']);
	const kestrel = useSettings<Kestrel>('com.lantharos.kestrel', ['accent', 'dark-schedule', 'dark-schedule-from', 'dark-schedule-to', 'pure-black', 'theme-apps']);

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let schedule = $derived(kestrel.values['dark-schedule'] ?? 'off');
	let twelveHour = $derived(desktop.values['clock-format'] === '12h');
	let accent = $derived(kestrel.values.accent ?? 'wallpaper');
	let accents = $derived<{ value: Accent; label: string; color: string }[]>([
		{ value: 'wallpaper', label: 'Wallpaper', color: appearance.wallpaperAccent ?? 'var(--accent)' },
		{ value: 'white', label: 'White', color: '#ffffff' }
	]);
</script>

<Section title="Style">
	<Row title="Appearance" description="Apps that follow the system switch with it">
		<Segmented
			label="Style"
			options={[
				{ value: 'light', label: 'Light' },
				{ value: 'dark', label: 'Dark' }
			]}
			value={dark ? 'dark' : 'light'}
			onchange={(style) => desktop.set('color-scheme', style === 'dark' ? 'prefer-dark' : 'default')}
		/>
	</Row>
	<Row
		title="Switch to dark automatically"
		description={SCHEDULE_NOTES[schedule]}
	>
		<Segmented label="Switch to dark automatically" options={SCHEDULES} value={schedule} onchange={(value) => kestrel.set('dark-schedule', value)} />
	</Row>
	{#if schedule === 'custom'}
		<Row title="Dark from">
			<TimePicker label="Dark from" {twelveHour} value={kestrel.values['dark-schedule-from'] ?? 20} onchange={(hours) => kestrel.set('dark-schedule-from', hours)} />
		</Row>
		<Row title="Light from">
			<TimePicker label="Light from" {twelveHour} value={kestrel.values['dark-schedule-to'] ?? 7} onchange={(hours) => kestrel.set('dark-schedule-to', hours)} />
		</Row>
	{/if}
	<Row title="Pure black" description="Fully black dark backgrounds, which save power on OLED">
		<Switch label="Pure black" checked={kestrel.values['pure-black'] ?? false} onchange={(on) => kestrel.set('pure-black', on)} />
	</Row>
	<Row
		title="Accent color"
		description={accent === 'white' ? 'White in the dark style, black in the light style' : 'Picked from your wallpaper'}
	>
		<Swatches label="Accent color" options={accents} value={accent} onchange={(value) => kestrel.set('accent', value)} />
	</Row>
	<Row title="Match other apps to the wallpaper" description="Other apps and terminals take on the same colors">
		<Switch label="Match other apps to the wallpaper" checked={kestrel.values['theme-apps'] ?? false} onchange={(on) => kestrel.set('theme-apps', on)} />
	</Row>
</Section>
