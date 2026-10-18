<script lang="ts">
	import { Row, Select, Switch } from '@luft/ui';
	import { powerOffAfter, setPowerOffAfter } from './api';

	const HOUR = 60 * 60;
	const DAY = 24 * HOUR;
	const DELAYS = [
		{ value: 12 * HOUR, label: '12 hours' },
		{ value: DAY, label: '1 day' },
		{ value: 2 * DAY, label: '2 days' },
		{ value: 3 * DAY, label: '3 days' },
		{ value: 7 * DAY, label: '1 week' }
	];

	let seconds = $state<number | null>(null);
	let failed = $state(false);

	let options = $derived(
		seconds === null || seconds === 0 || DELAYS.some((delay) => delay.value === seconds)
			? DELAYS
			: [...DELAYS, { value: seconds, label: `${Math.round(seconds / HOUR)} hours` }].sort((left, right) => left.value - right.value)
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
		title="Shut down after a long sleep"
		description={failed
			? "This couldn't be changed. Try again."
			: "Rather than letting the battery run flat while asleep, the computer shuts down when the battery gets low or after a long sleep on battery. Open windows aren't kept."}
	>
		<Switch label="Shut down after a long sleep" checked={seconds > 0} onchange={(on) => choose(on ? DAY : 0)} />
	</Row>
	{#if seconds > 0}
		<Row title="Shut down after">
			<Select label="Shut down after" {options} value={seconds} onchange={choose} />
		</Row>
	{/if}
{/if}
