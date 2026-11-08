<script lang="ts">
	import { t } from '@luft/i18n';
	import { Slider } from '@luft/ui';
	import { FEELS, feelOf } from './actions';

	interface Props {
		label: string;
		curve: number[] | undefined;
		onchange: (curve: number[]) => void;
	}

	let { label, curve, onchange }: Props = $props();
</script>

<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
	<span>{t('settings-pen-feel-soft')}</span>
	<Slider {label} value={feelOf(curve)} min={0} max={FEELS.length - 1} step={1} onchange={(index) => onchange(FEELS[index])} />
	<span>{t('settings-pen-feel-firm')}</span>
</div>
