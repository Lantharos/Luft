<script lang="ts">
	import { t } from '@luft/i18n';
	import { ProgressBar, Row, Section, Segmented } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Monitor, PenDevice, PowerDevice, PowerState } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import { PEN_KEYS, PEN_SCHEMA, type PenSettings } from './actions';
	import ButtonsSection from './ButtonsSection.svelte';
	import FeelSlider from './FeelSlider.svelte';
	import TabletRows from './TabletRows.svelte';

	const pen = useSettings<PenSettings>(PEN_SCHEMA, PEN_KEYS);

	let devices = $state<PenDevice[]>([]);
	let batteries = $state<PowerDevice[]>([]);
	let monitors = $state<Monitor[]>([]);
	let notes = $state(false);

	let tablets = $derived(devices.filter((device) => device.kind === 'tablet'));
	let choices = $derived({ notes, tablet: tablets.length > 0 });

	async function load() {
		devices = await commands.penDevices();
		notes = await commands.penNotesInstalled();
		monitors = (await commands.displayState()).monitors;
	}

	$effect(() => {
		void hardware.present;
		void load();
	});

	const pensIn = (state: PowerState) => (batteries = state.devices.filter((device) => device.kind === 'pen'));

	$effect(() => {
		void commands.powerState().then(pensIn);
		return events.powerChanged(pensIn);
	});
</script>

<svelte:window onfocus={load} />

<Section>
	<Row title={t('settings-pen-hand')} description={t('settings-pen-hand-description')}>
		<Segmented
			label={t('settings-pen-hand')}
			options={[
				{ value: 'left', label: t('settings-pen-hand-left') },
				{ value: 'right', label: t('settings-pen-hand-right') }
			]}
			value={pen.values.hand ?? 'right'}
			onchange={(hand) => pen.set('hand', hand)}
		/>
	</Row>
	<Row title={t('settings-pen-tip-feel')} description={t('settings-pen-tip-feel-description')}>
		{#snippet below()}
			<FeelSlider label={t('settings-pen-tip-feel')} curve={pen.values['pressure-curve']} onchange={(curve) => pen.set('pressure-curve', curve)} />
		{/snippet}
	</Row>
	<Row title={t('settings-pen-eraser-feel')}>
		{#snippet below()}
			<FeelSlider label={t('settings-pen-eraser-feel')} curve={pen.values['eraser-pressure-curve']} onchange={(curve) => pen.set('eraser-pressure-curve', curve)} />
		{/snippet}
	</Row>
</Section>

<ButtonsSection {pen} {choices} />

{#if batteries.length}
	<Section title={t('settings-pen-battery')}>
		{#each batteries as battery (battery.id)}
			<Row title={t('settings-pen-battery-pen')} description={battery.charging ? t('settings-pen-battery-charging') : undefined}>
				<ProgressBar fraction={battery.level / 100} class="w-16" />
				<span class="w-10 text-right tabular-nums">{percent(battery.level / 100)}</span>
			</Row>
		{/each}
	</Section>
{/if}

{#if tablets.length}
	<Section title={t('settings-pen-tablets')}>
		{#each tablets as tablet (tablet.id)}
			<TabletRows {tablet} {monitors} />
		{/each}
	</Section>
{/if}
