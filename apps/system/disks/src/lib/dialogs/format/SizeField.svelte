<script lang="ts">
	import { bytes, Slider, TextField } from '@luft/ui';

	interface Props {
		value: number;
		min: number;
		max: number;
		label: string;
	}

	let { value = $bindable(), min, max, label }: Props = $props();

	const MiB = 1024 * 1024;
	const GB = 1000 ** 3;

	let text = $state('');
	let shown = $derived((value / GB).toFixed(value >= 100 * GB ? 0 : 1));

	$effect.pre(() => {
		text = shown;
	});

	function clamp(next: number) {
		return Math.min(max, Math.max(min, Math.round(next / MiB) * MiB));
	}

	function commit() {
		if (text === shown) return;
		const parsed = Number.parseFloat(text.replace(',', '.'));
		text = shown;
		if (Number.isFinite(parsed)) value = clamp(parsed * GB);
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between gap-3 px-1">
		<span class="text-[13px] text-[var(--text-soft)]">{label}</span>
		<div class="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
			<div class="w-[96px]" onfocusout={commit}>
				<TextField label="{label} in gigabytes" inputmode="decimal" bind:value={text} onkeydown={(event) => event.key === 'Enter' && commit()} />
			</div>
			GB
		</div>
	</div>
	<Slider {label} {min} {max} step={MiB} {value} format={bytes} oninput={(next) => (value = next)} onchange={(next) => (value = next)} />
</div>
