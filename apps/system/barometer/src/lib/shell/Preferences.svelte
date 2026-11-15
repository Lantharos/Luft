<script lang="ts">
	import { t } from '@luft/i18n';
	import { duration, Popover, Segmented, Switch } from '@luft/ui';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { settings, type TemperatureUnit } from '#lib/state/settings.svelte.js';

	const speeds = $derived([
		{ value: 2000, label: t('barometer-preferences-speed-slow') },
		{ value: 1000, label: t('barometer-preferences-speed-normal') },
		{ value: 500, label: t('barometer-preferences-speed-fast') },
		{ value: 250, label: t('barometer-preferences-speed-faster') }
	]);

	const histories = $derived([30, 60, 120, 300, 600].map((value) => ({ value, label: duration(value) })));

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

<button bind:this={button} type="button" class="icon-button" aria-label={t('barometer-preferences')} aria-expanded={open} data-no-drag onclick={() => (open = !open)}>
	<SlidersHorizontal size={17} />
</button>

{#if open && button}
	<Popover anchor={button} label={t('barometer-preferences')} role="dialog" align="end" minWidth={340} maxHeight={560} onclose={() => (open = false)}>
		<div class="flex flex-col gap-4 p-3">
			<div class="flex flex-col gap-2">
				<span class="text-[13px] font-medium text-[var(--text-soft)]">{t('barometer-preferences-speed')}</span>
				<Segmented label={t('barometer-preferences-speed')} options={speeds} value={settings.value.interval} onchange={(interval) => settings.update({ interval })} />
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-[13px] font-medium text-[var(--text-soft)]">{t('barometer-preferences-history')}</span>
				<Segmented label={t('barometer-preferences-history')} options={histories} value={settings.value.history} onchange={(history) => settings.update({ history })} />
			</div>
			<div class="flex items-center justify-between gap-4">
				<span class="text-[13px] font-medium text-[var(--text-soft)]">{t('barometer-preferences-temperature')}</span>
				<Segmented label={t('barometer-preferences-temperature')} options={TEMPERATURES} value={settings.value.temperature} onchange={(temperature) => settings.update({ temperature })} />
			</div>
			<div class="flex flex-col">
				{@render toggle(t('barometer-preferences-glide'), t('barometer-preferences-glide-description'), settings.value.animateGraphs, (animateGraphs) => settings.update({ animateGraphs }))}
				{@render toggle(t('barometer-preferences-bits'), t('barometer-preferences-bits-description'), settings.value.networkBits, (networkBits) => settings.update({ networkBits }))}
				{@render toggle(t('barometer-preferences-share'), t('barometer-preferences-share-description'), settings.value.normalizeCpu, (normalizeCpu) => settings.update({ normalizeCpu }))}
				{@render toggle(t('barometer-preferences-virtual'), t('barometer-preferences-virtual-description'), settings.value.showVirtual, (showVirtual) => settings.update({ showVirtual }))}
			</div>
		</div>
	</Popover>
{/if}
