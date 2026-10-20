<script lang="ts">
	import { i18n } from '@luft/i18n';
	import { Row, Slider } from '@luft/ui';

	interface Props {
		title: string;
		seconds: number;
		min: number;
		max: number;
		onchange: (seconds: number) => void;
	}

	let { title, seconds, min, max, onchange }: Props = $props();

	let duration = $derived(new Intl.NumberFormat(i18n.formats, { style: 'unit', unit: 'second', unitDisplay: 'narrow', minimumFractionDigits: 1, maximumFractionDigits: 1 }));

	const format = (value: number) => duration.format(value);
</script>

<Row {title}>
	<span class="w-12 text-right tabular-nums">{format(seconds)}</span>
	{#snippet below()}
		<Slider label={title} {min} {max} step={0.1} value={seconds} {format} {onchange} />
	{/snippet}
</Row>
