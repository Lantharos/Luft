<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Select, Switch } from '@luft/ui';
	import { powerOffAfter, setPowerOffAfter } from './api';

	const HOUR = 60 * 60;
	const DAY = 24 * HOUR;
	const WEEK = 7 * DAY;
	const DELAYS = [12 * HOUR, DAY, 2 * DAY, 3 * DAY, WEEK];

	function delayLabel(value: number) {
		if (value % WEEK === 0) return t('settings-power-long-sleep-weeks', { weeks: value / WEEK });
		if (value % DAY === 0) return t('settings-power-long-sleep-days', { days: value / DAY });
		return t('settings-power-long-sleep-hours', { hours: Math.round(value / HOUR) });
	}

	let seconds = $state<number | null>(null);
	let failed = $state(false);

	let options = $derived(
		(seconds === null || seconds === 0 || DELAYS.includes(seconds) ? DELAYS : [...DELAYS, seconds].sort((left, right) => left - right)).map((value) => ({
			value,
			label: delayLabel(value)
		}))
	);

	$effect(() => {
		void powerOffAfter().then((current) => (seconds = current));
	});

	async function choose(next: number) {
		const previous = seconds;
		seconds = next;
		failed = false;
		try {
			await setPowerOffAfter(next);
		} catch {
			seconds = previous;
			failed = true;
		}
	}
</script>

{#if seconds !== null}
	<Row
		title={t('settings-power-long-sleep')}
		description={failed ? t('settings-power-long-sleep-failed') : t('settings-power-long-sleep-description')}
	>
		<Switch label={t('settings-power-long-sleep')} checked={seconds > 0} onchange={(on) => choose(on ? DAY : 0)} />
	</Row>
	{#if seconds > 0}
		<Row title={t('settings-power-long-sleep-after')}>
			<Select label={t('settings-power-long-sleep-after')} {options} value={seconds} onchange={choose} />
		</Row>
	{/if}
{/if}
