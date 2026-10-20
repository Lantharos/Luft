<script lang="ts">
	import { t } from '@luft/i18n';
	import { Slider } from '@luft/ui';

	interface Props {
		label: string;
		value: number;
		disabled?: boolean;
		min?: number;
		max?: number;
		onchange: (value: number) => void;
	}

	let { label, value, disabled = false, min = -1, max = 1, onchange }: Props = $props();
</script>

<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
	<span>{t('settings-mouse-slower')}</span>
	<Slider {label} {value} {disabled} {min} {max} step={0.05} {onchange} />
	<span>{t('settings-mouse-faster')}</span>
</div>
