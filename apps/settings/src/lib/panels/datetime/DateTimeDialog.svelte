<script lang="ts">
	import { untrack } from 'svelte';
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import Segmented from '$lib/components/controls/Segmented.svelte';
	import { setTime } from './api';
	import Calendar from './Calendar.svelte';
	import TimeStepper from './TimeStepper.svelte';
	import { toEpoch, wallTime } from './zones';

	interface Props {
		zone: string;
		hour12: boolean;
		onclose: () => void;
	}

	let { zone, hour12, onclose }: Props = $props();

	let time = $state(untrack(() => wallTime(zone, Date.now())));
	let saving = $state(false);
	let failed = $state(false);

	let afternoon = $derived(time.hour >= 12);

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

<Dialog title="Set date and time" {onclose}>
	<Calendar
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
			label="Hour"
			min={hour12 ? 1 : 0}
			max={hour12 ? 12 : 23}
			value={hour12 ? time.hour % 12 || 12 : time.hour}
			onchange={setHour}
		/>
		<span class="pb-0.5 text-[26px] font-semibold text-[var(--text-muted)]">:</span>
		<TimeStepper label="Minute" min={0} max={59} value={time.minute} onchange={(minute) => (time.minute = minute)} />
		{#if hour12}
			<div class="ml-3">
				<Segmented
					label="Morning or afternoon"
					options={[
						{ value: 'am', label: 'AM' },
						{ value: 'pm', label: 'PM' }
					]}
					value={afternoon ? 'pm' : 'am'}
					onchange={(half) => (time.hour = (time.hour % 12) + (half === 'pm' ? 12 : 0))}
				/>
			</div>
		{/if}
	</div>
	{#if failed}
		<p class="text-[13px] text-[var(--danger)]">The date and time couldn't be changed.</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={saving} onclick={save}>Set</button>
	{/snippet}
</Dialog>
