<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Slider, Switch } from '@luft/ui';
	import { settings } from '#lib/app/settings.svelte.js';
	import { commands } from '#lib/bindings.js';
	import ConvertSection from './ConvertSection.svelte';
	import HandwritingSection from './HandwritingSection.svelte';
	import LayoutSection from './LayoutSection.svelte';
	import PressureCurve from './PressureCurve.svelte';

	let { onclose }: { onclose: () => void } = $props();
</script>

{#snippet toggle(label: string, detail: string, checked: boolean, onchange: (value: boolean) => void)}
	<div class="flex items-center justify-between gap-4">
		<div class="min-w-0">
			<p class="text-[13.5px]">{label}</p>
			<p class="text-[12px] text-(--text-muted)">{detail}</p>
		</div>
		<Switch {label} {checked} {onchange} />
	</div>
{/snippet}

<Dialog title={t('settings-title')} wide {onclose}>
	<div class="flex max-h-[60vh] flex-col gap-6 overflow-x-hidden overflow-y-auto pr-1 soft-scroll *:flex-none">
		<section class="flex gap-5">
			<PressureCurve firmness={settings.values.firmness} onchange={(value) => settings.set('firmness', value)} />
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<h3 class="text-[14px] font-semibold">{t('settings-pressure')}</h3>
				<p class="text-[12.5px] text-(--text-soft)">{t('settings-pressure-body')}</p>
				<Slider
					label={t('settings-smoothing')}
					value={settings.values.stabilization}
					min={0}
					max={1}
					step={0.05}
					format={(value) => t('settings-smoothing-value', { percent: Math.round(value * 100) })}
					onchange={(value) => settings.set('stabilization', value)}
				/>
				<p class="text-[12px] text-(--text-muted)">{t('settings-smoothing-body')}</p>
			</div>
		</section>
		<section class="flex items-center justify-between gap-4">
			<div class="min-w-0">
				<h3 class="text-[14px] font-semibold">{t('settings-buttons')}</h3>
				<p class="text-[12.5px] text-(--text-soft)">{t('settings-buttons-body')}</p>
			</div>
			<button type="button" class="button flex-none" onclick={() => void commands.openPenSettings()}>{t('settings-buttons-open')}</button>
		</section>
		<section class="flex flex-col gap-4">
			{@render toggle(t('settings-prediction'), t('settings-prediction-body'), settings.values.prediction, (value) => settings.set('prediction', value))}
			{@render toggle(t('settings-finger-pans'), t('settings-finger-pans-body'), settings.values.fingerPans, (value) => settings.set('fingerPans', value))}
			{@render toggle(t('settings-touch-draws'), t('settings-touch-draws-body'), settings.values.touchDraws, (value) => settings.set('touchDraws', value))}
		</section>
		<LayoutSection />
		<HandwritingSection />
		<ConvertSection />
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('dialog-done')}</button>
	{/snippet}
</Dialog>
