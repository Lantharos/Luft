<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { Row, Section, Segmented, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { clock as readClock, onClockChanged, setAutomatic, zones as readZones, type Clock, type Zone } from './api';
	import DateTimeDialog from './DateTimeDialog.svelte';
	import TimeZoneDialog from './TimeZoneDialog.svelte';
	import { useWeekStart, weekdayName } from './weekStart.svelte';
	import { city, country, offsetLabel, offsetMinutes } from './zones';

	type Interface = { 'clock-format': string; 'clock-show-seconds': boolean; 'clock-show-weekday': boolean };
	type Datetime = { 'automatic-timezone': boolean };
	type Location = { enabled: boolean };

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['clock-format', 'clock-show-seconds', 'clock-show-weekday']);
	const datetime = useSettings<Datetime>('org.gnome.desktop.datetime', ['automatic-timezone']);
	const location = useSettings<Location>('org.gnome.system.location', ['enabled']);
	const weekStart = useWeekStart();

	let clock = $state<Clock | null>(null);
	let zones = $state<Zone[]>([]);
	let now = $state(Date.now());
	let editing = $state<'zone' | 'time' | null>(null);

	let hour12 = $derived(desktop.values['clock-format'] === '12h');
	let seconds = $derived(desktop.values['clock-show-seconds'] ?? false);
	let automaticZone = $derived(datetime.values['automatic-timezone'] ?? false);
	let zone = $derived(clock?.timezone ?? 'UTC');
	let timeFormat = $derived(
		new Intl.DateTimeFormat(i18n.formats, { timeZone: zone, hour: 'numeric', minute: '2-digit', second: seconds ? '2-digit' : undefined, hourCycle: hour12 ? 'h12' : 'h23' })
	);
	let dateFormat = $derived(new Intl.DateTimeFormat(i18n.formats, { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
	let shortFormat = $derived(
		new Intl.DateTimeFormat(i18n.formats, { timeZone: zone, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hourCycle: hour12 ? 'h12' : 'h23' })
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
	{#if clock?.canAutomatic}
		<Row title={t('settings-datetime-automatic')} description={t('settings-datetime-automatic-description')}>
			<Switch label={t('settings-datetime-automatic')} checked={clock.automatic} onchange={toggleAutomatic} />
		</Row>
	{/if}
	<Row title={t('settings-datetime-date-and-time')} disabled={!clock || clock.automatic} onclick={() => (editing = 'time')}>
		<span class="tabular-nums">{shortFormat.format(now)}</span>
	</Row>
</Section>

<Section>
	<Row
		title={t('settings-datetime-automatic-zone')}
		description={automaticZone && !location.values.enabled ? t('settings-datetime-automatic-zone-location-off') : t('settings-datetime-automatic-zone-description')}
	>
		<Switch label={t('settings-datetime-automatic-zone')} checked={automaticZone} onchange={(on) => datetime.set('automatic-timezone', on)} />
	</Row>
	<Row
		title={t('settings-datetime-zone')}
		description={place ? t('settings-datetime-zone-description', { place, offset }) : offset}
		disabled={!clock || automaticZone}
		onclick={() => (editing = 'zone')}
	>
		<span>{city(zone)}</span>
	</Row>
</Section>

<Section title={t('settings-datetime-clock')}>
	<Row title={t('settings-datetime-time-format')}>
		<Segmented
			label={t('settings-datetime-time-format')}
			options={[
				{ value: '24h', label: t('settings-datetime-format-24h') },
				{ value: '12h', label: t('settings-datetime-format-12h') }
			]}
			value={hour12 ? '12h' : '24h'}
			onchange={(format) => desktop.set('clock-format', format)}
		/>
	</Row>
	<Row title={t('settings-datetime-seconds')}>
		<Switch label={t('settings-datetime-seconds')} checked={seconds} onchange={(on) => desktop.set('clock-show-seconds', on)} />
	</Row>
	<Row title={t('settings-datetime-weekday')}>
		<Switch
			label={t('settings-datetime-weekday')}
			checked={desktop.values['clock-show-weekday'] ?? false}
			onchange={(on) => desktop.set('clock-show-weekday', on)}
		/>
	</Row>
</Section>

<Section title={t('settings-datetime-calendar')}>
	<Row
		title={t('settings-datetime-week-start')}
		description={weekStart.choice === 'automatic' ? t('settings-datetime-week-start-regional', { day: weekdayName(weekStart.regional, 'long') }) : undefined}
	>
		<Segmented
			label={t('settings-datetime-week-start')}
			options={[
				{ value: 'automatic', label: t('settings-datetime-week-start-automatic') },
				{ value: 'monday', label: t('settings-datetime-week-start-monday') },
				{ value: 'sunday', label: t('settings-datetime-week-start-sunday') }
			]}
			value={weekStart.choice}
			onchange={weekStart.choose}
		/>
	</Row>
</Section>

{#if editing === 'zone'}
	<TimeZoneDialog {zones} current={zone} {minute} {hour12} onclose={() => (editing = null)} />
{:else if editing === 'time'}
	<DateTimeDialog {zone} {hour12} firstWeekday={weekStart.firstDay} onclose={() => (editing = null)} />
{/if}
