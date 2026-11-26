<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Slider } from '@luft/ui';
	import { AS_SHOT, type Develop, type RawDevelopment } from './develop';

	let { development, onclose }: { development: RawDevelopment; onclose: () => void } = $props();

	const FIELDS: { key: keyof Develop; label: () => string; min: number; max: number; step: number; unit: string }[] = [
		{ key: 'exposure', label: () => t('easel-develop-exposure'), min: -3, max: 3, step: 0.05, unit: ' EV' },
		{ key: 'temperature', label: () => t('easel-develop-temperature'), min: -100, max: 100, step: 1, unit: '' },
		{ key: 'tint', label: () => t('easel-develop-tint'), min: -100, max: 100, step: 1, unit: '' },
		{ key: 'highlights', label: () => t('easel-develop-highlights'), min: -100, max: 100, step: 1, unit: '' },
		{ key: 'shadows', label: () => t('easel-develop-shadows'), min: -100, max: 100, step: 1, unit: '' }
	];

	let values = $state<Develop>({ ...AS_SHOT });

	function set(key: keyof Develop, value: number) {
		values[key] = value;
		development.update(values);
	}

	function reset() {
		values = { ...AS_SHOT };
		development.update(values);
	}

	const shown = (field: (typeof FIELDS)[number]) => `${field.step < 1 ? values[field.key].toFixed(2) : Math.round(values[field.key])}${field.unit}`;
</script>

<Dialog title={t('easel-develop-title')} {onclose}>
	<div class="flex flex-col gap-4 px-2.5 py-3">
		{#each FIELDS as field (field.key)}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between text-[13px]"><span>{field.label()}</span><span class="text-(--text-muted) tabular-nums">{shown(field)}</span></div>
				<Slider label={field.label()} value={values[field.key]} min={field.min} max={field.max} step={field.step} oninput={(value) => set(field.key, value)} onchange={(value) => set(field.key, value)} />
			</div>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={reset}>{t('easel-develop-reset')}</button>
		<button type="button" class="button primary" onclick={onclose}>{t('easel-done')}</button>
	{/snippet}
</Dialog>
