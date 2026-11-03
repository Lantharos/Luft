<script lang="ts">
	import { i18n } from '@luft/i18n';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	let { vertical }: { vertical: boolean } = $props();

	const CLOCK_TICK = 30_000;

	type Clock = { 'clock-format': string; 'clock-show-weekday': boolean };
	const clock = useSettings<Clock>('org.gnome.desktop.interface', ['clock-format', 'clock-show-weekday']);

	let now = $state(new Date());
	let twelveHour = $derived(clock.values['clock-format'] === '12h');
	let time = $derived(
		new Intl.DateTimeFormat(i18n.formats, twelveHour ? { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' } : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
	);
	let date = $derived(
		new Intl.DateTimeFormat(i18n.formats, { ...(clock.values['clock-show-weekday'] ? { weekday: 'short' } : {}), day: 'numeric', month: 'short' }).format(now)
	);

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), CLOCK_TICK);
		return () => clearInterval(timer);
	});
</script>

{#if vertical}
	<span class="time vertical">{time}</span>
{:else}
	<span class="time stacked"><span>{date}</span><span>{time}</span></span>
{/if}

<style>
	.time {
		padding: 0 4px;
		font-size: 10px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		text-shadow: var(--status-text-halo);
		white-space: nowrap;
	}

	.vertical {
		padding: 4px 0;
		font-size: 8px;
	}

	.stacked {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 7.5px;
		line-height: 1.2;
	}
</style>
