<script lang="ts">
	import { Popover, Segmented, Switch } from '@luft/ui';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { settings, type TemperatureUnit } from '$lib/state/settings.svelte';

	const SPEEDS = [
		{ value: 2000, label: 'Slow' },
		{ value: 1000, label: 'Normal' },
		{ value: 500, label: 'Fast' },
		{ value: 250, label: 'Faster' }
	];

	const HISTORIES = [
		{ value: 30, label: '30s' },
		{ value: 60, label: '1m' },
		{ value: 120, label: '2m' },
		{ value: 300, label: '5m' },
		{ value: 600, label: '10m' }
	];

	const TEMPERATURES: { value: TemperatureUnit; label: string }[] = [
		{ value: 'celsius', label: '°C' },
		{ value: 'fahrenheit', label: '°F' }
	];

	let button = $state<HTMLButtonElement>();
	let open = $state(false);
</script>

{#snippet toggle(label: string, description: string, checked: boolean, onchange: (value: boolean) => void)}
	<div class="flex items-center gap-4 py-1.5">
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="text-[13.5px]">{label}</span>
			<span class="text-[12px] leading-snug text-[var(--text-muted)]">{description}</span>
		</div>
		<Switch {checked} {label} {onchange} />
	</div>
{/snippet}

<button bind:this={button} type="button" class="icon-button" aria-label="Preferences" aria-expanded={open} data-no-drag onclick={() => (open = !open)}>
	<SlidersHorizontal size={17} />
</button>

{#if open && button}
	<Popover anchor={button} label="Preferences" role="dialog" align="end" minWidth={340} maxHeight={560} onclose={() => (open = false)}>
		<div class="flex flex-col gap-4 p-3">
			<div class="flex flex-col gap-2">
				<span class="text-[13px] font-medium text-[var(--text-soft)]">Update speed</span>
				<Segmented label="Update speed" options={SPEEDS} value={settings.value.interval} onchange={(interval) => settings.update({ interval })} />
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-[13px] font-medium text-[var(--text-soft)]">History</span>
				<Segmented label="History" options={HISTORIES} value={settings.value.history} onchange={(history) => settings.update({ history })} />
			</div>
			<div class="flex items-center justify-between gap-4">
				<span class="text-[13px] font-medium text-[var(--text-soft)]">Temperature</span>
				<Segmented label="Temperature" options={TEMPERATURES} value={settings.value.temperature} onchange={(temperature) => settings.update({ temperature })} />
			</div>
			<div class="flex flex-col">
				{@render toggle('Glide graphs', 'Slide graphs along as new values come in', settings.value.animateGraphs, (animateGraphs) => settings.update({ animateGraphs }))}
				{@render toggle('Network speed in bits', 'Show Mbit/s instead of MB/s', settings.value.networkBits, (networkBits) => settings.update({ networkBits }))}
				{@render toggle('Share of the whole processor', 'Process usage out of all cores instead of one', settings.value.normalizeCpu, (normalizeCpu) => settings.update({ normalizeCpu }))}
				{@render toggle('Virtual devices', 'Loop devices, bridges and other virtual drives and networks', settings.value.showVirtual, (showVirtual) => settings.update({ showVirtual }))}
			</div>
		</div>
	</Popover>
{/if}
