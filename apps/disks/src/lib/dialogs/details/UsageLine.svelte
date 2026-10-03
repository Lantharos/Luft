<script lang="ts">
	import { bytes } from '#lib/format.js';

	interface Props {
		used: number;
		size: number;
	}

	let { used, size }: Props = $props();

	let share = $derived(size > 0 ? Math.min(1, used / size) : 0);
</script>

<div class="flex flex-col gap-2.5 px-1">
	<div class="flex items-baseline justify-between gap-4 tabular-nums">
		<span class="text-[15px] font-medium">{bytes(used)} used</span>
		<span class="text-[13px] text-[var(--text-muted)]">{bytes(Math.max(0, size - used))} free</span>
	</div>
	<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
		<div class="h-full origin-left rounded-full bg-[var(--accent)]" style:transform="scaleX({share})"></div>
	</div>
</div>
