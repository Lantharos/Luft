<script lang="ts">
	import Slider from '$lib/components/controls/Slider.svelte';

	interface Props {
		label: string;
		value: number;
		disabled?: boolean;
		onchange: (value: number) => void;
	}

	let { label, value, disabled = false, onchange }: Props = $props();
</script>

<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
	<span>Slower</span>
	<Slider {label} {value} {disabled} min={-1} max={1} step={0.05} {onchange} />
	<span>Faster</span>
</div>
