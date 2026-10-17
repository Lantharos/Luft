<script lang="ts">
	import { session, type Failure, type Task } from '#lib/state/meet.svelte.js';

	const SAID: Record<Task, string> = {
		check: 'Meet Luft couldn’t finish looking at this PC.',
		room: 'Making room for Luft didn’t finish.',
		update: 'Updating Luft didn’t finish.',
		download: 'Luft’s download stopped. Check that you’re online.',
		pack: 'Packing your things didn’t finish.',
		remove: 'Removing Luft didn’t finish.',
		restart: 'Meet Luft couldn’t set up the restart.',
		tidy: 'The old start entries couldn’t be removed.',
		firmware: 'Meet Luft couldn’t open the firmware settings.',
		folders: 'Meet Luft couldn’t look through your folders.',
		sticks: 'Meet Luft couldn’t look for USB drives.',
		stick: 'Making the stick didn’t finish.',
		offers: 'Luft can’t be downloaded right now. Check that you’re online, or use an ISO you already have.'
	};
	const DECLINED = {
		windows: 'Meet Luft needs your permission to work on the drive. Choose Yes when Windows asks.',
		linux: 'Meet Luft needs your permission to work on the drive. Enter your password when it asks.'
	};

	let { failure }: { failure: Failure } = $props();
	let said = $derived(
		failure.task === 'stick' && failure.detail
			? failure.detail
			: failure.task === 'room' && session.platform === 'linux'
				? 'Getting Luft ready didn’t finish.'
				: SAID[failure.task]
	);
</script>

<div class="flex items-center gap-2 text-[13.5px]" role="alert">
	<span class="text-[var(--danger)]">{failure.declined ? DECLINED[session.platform] : said}</span>
	<button type="button" class="plain-button shrink-0" onclick={() => failure.retry()}>Try again</button>
</div>
