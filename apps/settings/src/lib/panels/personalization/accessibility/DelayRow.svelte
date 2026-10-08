<script lang="ts">
	import { Row, Slider } from '@luft/ui';

	interface Props {
		title: string;
		seconds: number;
		min: number;
		max: number;
		onchange: (seconds: number) => void;
	}

	let { title, seconds, min, max, onchange }: Props = $props();

	const format = (value: number) => `${value.toFixed(1)} s`;
</script>

<Row {title}>
	<span class="w-12 text-right tabular-nums">{format(seconds)}</span>
	{#snippet below()}
		<Slider label={title} {min} {max} step={0.1} value={seconds} {format} {onchange} />
	{/snippet}
</Row>
