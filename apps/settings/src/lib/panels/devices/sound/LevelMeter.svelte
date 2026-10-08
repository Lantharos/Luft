<script lang="ts">
	interface Props {
		level: number;
	}

	const FLOOR_DECIBELS = -60;

	let { level }: Props = $props();

	let loudness = $derived(level > 0 ? Math.max(0, 1 - (20 * Math.log10(level)) / FLOOR_DECIBELS) : 0);
</script>

<div class="meter" role="meter" aria-label="Input level" aria-valuemin={0} aria-valuemax={1} aria-valuenow={loudness}>
	<div class="fill" style:transform="scaleX({loudness})"></div>
</div>

<style>
	.meter {
		height: 6px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--control);
	}

	.fill {
		height: 100%;
		transform-origin: left;
		border-radius: var(--radius-pill);
		background: var(--accent);
		transition: transform 90ms linear;
	}
</style>
