<script lang="ts">
	import { bytes, Slider } from '@luft/ui';

	interface Props {
		value: number;
		min: number;
		max: number;
		label: string;
	}

	let { value = $bindable(), min, max, label }: Props = $props();

	const MiB = 1024 * 1024;
	const GB = 1000 ** 3;

	let typed = $state<string | null>(null);
	let shown = $derived(typed ?? (value / GB).toFixed(value >= 100 * GB ? 0 : 1));

	function clamp(next: number) {
		return Math.min(max, Math.max(min, Math.round(next / MiB) * MiB));
	}

	function commit() {
		if (typed === null) return;
		const parsed = Number.parseFloat(typed.replace(',', '.'));
		if (Number.isFinite(parsed)) value = clamp(parsed * GB);
		typed = null;
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between gap-3 px-1">
		<span class="text-[13px] text-[var(--text-soft)]">{label}</span>
		<label class="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
			<input
				class="text-field w-[96px] text-right"
				inputmode="decimal"
				aria-label="{label} in gigabytes"
				value={shown}
				oninput={(event) => (typed = event.currentTarget.value)}
				onblur={commit}
				onkeydown={(event) => event.key === 'Enter' && commit()}
			/>
			GB
		</label>
	</div>
	<Slider {label} {min} {max} step={MiB} {value} format={bytes} oninput={(next) => (value = next)} onchange={(next) => (value = next)} />
	<p class="px-1 text-[12px] text-[var(--text-muted)]">{bytes(min)} to {bytes(max)}</p>
</div>
