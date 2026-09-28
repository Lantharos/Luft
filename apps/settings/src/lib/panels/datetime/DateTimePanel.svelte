<script lang="ts">
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Segmented from '$lib/components/controls/Segmented.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { clock as readClock, onClockChanged, setAutomatic, zones as readZones, type Clock, type Zone } from './api';
	import DateTimeDialog from './DateTimeDialog.svelte';
	import TimeZoneDialog from './TimeZoneDialog.svelte';
	import { city, country, offsetLabel, offsetMinutes } from './zones';

	type Interface = { 'clock-format': string; 'clock-show-seconds': boolean; 'clock-show-weekday': boolean };
	type Datetime = { 'automatic-timezone': boolean };
	type Location = { enabled: boolean };

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['clock-format', 'clock-show-seconds', 'clock-show-weekday']);
	const datetime = useSettings<Datetime>('org.gnome.desktop.datetime', ['automatic-timezone']);
	const location = useSettings<Location>('org.gnome.system.location', ['enabled']);

	let clock = $state<Clock | null>(null);
	let zones = $state<Zone[]>([]);
	let now = $state(Date.now());
	let editing = $state<'zone' | 'time' | null>(null);

	let hour12 = $derived(desktop.values['clock-format'] === '12h');
	let seconds = $derived(desktop.values['clock-show-seconds'] ?? false);
	let automaticZone = $derived(datetime.values['automatic-timezone'] ?? false);
	let zone = $derived(clock?.timezone ?? 'UTC');
	let timeFormat = $derived(
		new Intl.DateTimeFormat(undefined, { timeZone: zone, hour: 'numeric', minute: '2-digit', second: seconds ? '2-digit' : undefined, hourCycle: hour12 ? 'h12' : 'h23' })
	);
	let dateFormat = $derived(new Intl.DateTimeFormat(undefined, { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
	let shortFormat = $derived(
		new Intl.DateTimeFormat(undefined, { timeZone: zone, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hourCycle: hour12 ? 'h12' : 'h23' })
	);
	let place = $derived(country(zones.find((entry) => entry.id === zone)?.country ?? null));
	let minute = $derived(Math.floor(now / 60000) * 60000);
	let offset = $derived(offsetLabel(offsetMinutes(zone, minute)));

	$effect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const tick = () => {
			now = Date.now();
			timer = setTimeout(tick, 1000 - (now % 1000));
		};
		tick();
		return () => clearTimeout(timer);
	});

	$effect(() => {
		void readClock().then((state) => (clock = state));
		void readZones().then((list) => (zones = list));
		return onClockChanged((state) => (clock = state));
	});

	async function toggleAutomatic(enabled: boolean) {
		if (!clock) return;
		clock.automatic = enabled;
		try {
			await setAutomatic(enabled);
		} catch {
			clock.automatic = !enabled;
		}
	}
</script>

{#if clock}
	<div class="flex flex-col gap-1 px-2 pb-2">
		<span class="text-[34px] leading-tight font-semibold tabular-nums">{timeFormat.format(now)}</span>
		<span class="text-[14px] text-[var(--text-muted)]">{dateFormat.format(now)}</span>
	</div>
{/if}

<Section>
	<Row
		title="Set the time automatically"
		description={clock && !clock.canAutomatic ? "This computer can't set its time automatically" : 'Keeps the clock accurate using the internet'}
	>
		<Switch
			label="Set the time automatically"
			checked={clock?.automatic ?? false}
			disabled={!clock?.canAutomatic}
			onchange={toggleAutomatic}
		/>
	</Row>
	<Row title="Date and time" disabled={!clock || clock.automatic} onclick={() => (editing = 'time')}>
		<span class="tabular-nums">{shortFormat.format(now)}</span>
	</Row>
</Section>

<Section>
	<Row
		title="Set the time zone automatically"
		description={automaticZone && !location.values.enabled ? 'Turn on location services in Privacy & Security to use this' : 'Follows your location when you travel'}
	>
		<Switch label="Set the time zone automatically" checked={automaticZone} onchange={(on) => datetime.set('automatic-timezone', on)} />
	</Row>
	<Row
		title="Time zone"
		description={place ? `${place} · ${offset}` : offset}
		disabled={!clock || automaticZone}
		onclick={() => (editing = 'zone')}
	>
		<span>{city(zone)}</span>
	</Row>
</Section>

<Section title="Clock">
	<Row title="Time format">
		<Segmented
			label="Time format"
			options={[
				{ value: '24h', label: '24-hour' },
				{ value: '12h', label: 'AM/PM' }
			]}
			value={hour12 ? '12h' : '24h'}
			onchange={(format) => desktop.set('clock-format', format)}
		/>
	</Row>
	<Row title="Show seconds">
		<Switch label="Show seconds" checked={seconds} onchange={(on) => desktop.set('clock-show-seconds', on)} />
	</Row>
	<Row title="Show the day of the week">
		<Switch
			label="Show the day of the week"
			checked={desktop.values['clock-show-weekday'] ?? false}
			onchange={(on) => desktop.set('clock-show-weekday', on)}
		/>
	</Row>
</Section>

{#if editing === 'zone'}
	<TimeZoneDialog {zones} current={zone} {minute} {hour12} onclose={() => (editing = null)} />
{:else if editing === 'time'}
	<DateTimeDialog {zone} {hour12} onclose={() => (editing = null)} />
{/if}
