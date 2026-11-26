<script lang="ts">
	import { Slider } from '@luft/ui';

	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		format: (value: number) => string;
		onchange: (value: number) => void;
	}

	let { label, value, min, max, step = 1, format, onchange }: Props = $props();
</script>

<div class="flex flex-col gap-2 px-1">
	<div class="flex justify-between text-[13px]">
		<span>{label}</span>
		<span class="text-(--text-muted) tabular-nums">{format(value)}</span>
	</div>
	<Slider {label} {value} {min} {max} {step} oninput={onchange} {onchange} />
</div>
