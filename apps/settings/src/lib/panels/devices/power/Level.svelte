<script lang="ts">
	interface Props {
		level: number;
		low?: boolean;
	}

	let { level, low = false }: Props = $props();
</script>

<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
	<div class="level h-full rounded-full" class:low style:width="{Math.min(100, Math.max(0, level))}%"></div>
</div>

<style>
	.level {
		background: var(--accent);
		transition: width 400ms var(--ease);
	}

	.level.low {
		background: var(--danger);
	}
</style>
