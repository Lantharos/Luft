<script lang="ts">
	interface Props {
		level: number;
		low?: boolean;
	}

	let { level, low = false }: Props = $props();
</script>

<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
	<div class="level progress-fill h-full rounded-full" class:low style:--progress={Math.min(100, Math.max(0, level)) / 100}></div>
</div>

<style>
	.level {
		background: var(--accent);
	}

	.level.low {
		background: var(--danger);
	}
</style>
