<script lang="ts">
	import { appearance, Row, Section, Segmented, Switch } from '@luft/ui';
	import TimePicker from '$lib/components/TimePicker.svelte';
	import { useSettings } from '$lib/state/gsettings.svelte';

	type Schedule = 'off' | 'sunset' | 'custom';
	type Interface = {
		'color-scheme': string;
		'clock-format': string;
	};
	type Kestrel = {
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

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['color-scheme', 'clock-format']);
	const kestrel = useSettings<Kestrel>('dev.lantharos.kestrel', ['dark-schedule', 'dark-schedule-from', 'dark-schedule-to', 'pure-black', 'theme-apps']);

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let schedule = $derived(kestrel.values['dark-schedule'] ?? 'off');
	let twelveHour = $derived(desktop.values['clock-format'] === '12h');
	let swatches = $derived([appearance.accent ?? 'var(--accent)', appearance.colors.secondary, appearance.colors.tertiary].filter(Boolean));
</script>

<Section title="Style">
	<Row title="Appearance" description="Apps that follow the system switch between light and dark with it">
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
		description={schedule === 'sunset' ? 'Follows sunset and sunrise where you are' : 'Choosing a style yourself lasts until the next switch'}
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
	<Row title="Pure black" description="Dark backgrounds turn fully black, which saves power on OLED displays">
		<Switch label="Pure black" checked={kestrel.values['pure-black'] ?? false} onchange={(on) => kestrel.set('pure-black', on)} />
	</Row>
	<Row title="Wallpaper colors" description="Picked from your wallpaper and used across the desktop and apps">
		<div class="flex gap-1.5">
			{#each swatches as color, index (index)}
				<span class="h-6 w-6 rounded-full" style:background={color}></span>
			{/each}
		</div>
	</Row>
	<Row title="Match other apps to the wallpaper" description="Other apps and terminals take on the same colors">
		<Switch label="Match other apps to the wallpaper" checked={kestrel.values['theme-apps'] ?? false} onchange={(on) => kestrel.set('theme-apps', on)} />
	</Row>
</Section>
