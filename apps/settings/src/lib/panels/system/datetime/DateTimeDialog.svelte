<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { Dialog, Segmented } from '@luft/ui';
	import { setTime } from './api';
	import Calendar from './Calendar.svelte';
	import TimeStepper from './TimeStepper.svelte';
	import { dayPeriods, toEpoch, wallTime } from './zones';

	interface Props {
		zone: string;
		hour12: boolean;
		firstWeekday: number;
		onclose: () => void;
	}

	let { zone, hour12, firstWeekday, onclose }: Props = $props();

	let time = $state(untrack(() => wallTime(zone, Date.now())));
	let saving = $state(false);
	let failed = $state(false);

	let afternoon = $derived(time.hour >= 12);
	let periods = $derived(dayPeriods(i18n.formats));

	function setHour(hour: number) {
		time.hour = hour12 ? (hour % 12) + (afternoon ? 12 : 0) : hour;
	}

	async function save() {
		saving = true;
		failed = false;
		try {
			const second = wallTime(zone, Date.now()).second;
			await setTime(toEpoch(zone, { ...time, second }) * 1000);
			onclose();
		} catch {
			failed = true;
		} finally {
			saving = false;
		}
	}
</script>

<Dialog title={t('settings-datetime-set-title')} {onclose}>
	<Calendar
		{firstWeekday}
		year={time.year}
		month={time.month}
		day={time.day}
		onselect={(year, month, day) => {
			time.year = year;
			time.month = month;
			time.day = day;
		}}
	/>
	<div class="flex items-center justify-center gap-2 pt-2">
		<TimeStepper
			label={t('settings-datetime-hour')}
			min={hour12 ? 1 : 0}
			max={hour12 ? 12 : 23}
			value={hour12 ? time.hour % 12 || 12 : time.hour}
			onchange={setHour}
		/>
		<span class="pb-0.5 text-[26px] font-semibold text-[var(--text-muted)]">:</span>
		<TimeStepper label={t('settings-datetime-minute')} min={0} max={59} value={time.minute} onchange={(minute) => (time.minute = minute)} />
		{#if hour12}
			<div class="ml-3">
				<Segmented
					label={t('settings-datetime-day-period')}
					options={[
						{ value: 'am', label: periods.am },
						{ value: 'pm', label: periods.pm }
					]}
					value={afternoon ? 'pm' : 'am'}
					onchange={(half) => (time.hour = (time.hour % 12) + (half === 'pm' ? 12 : 0))}
				/>
			</div>
		{/if}
	</div>
	{#if failed}
		<p class="text-[13px] text-[var(--danger)]">{t('settings-datetime-set-failed')}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-datetime-cancel')}</button>
		<button type="button" class="button primary" disabled={saving} onclick={save}>{t('settings-datetime-set')}</button>
	{/snippet}
</Dialog>
