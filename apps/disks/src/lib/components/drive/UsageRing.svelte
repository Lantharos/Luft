<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';

	interface Props {
		tone: string;
		share: number | null;
		locked?: boolean;
	}

	let { tone, share, locked = false }: Props = $props();

	const RADIUS = 7;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
</script>

<span class="usage" style:--tone={tone}>
	{#if locked}
		<Lock size={16} />
	{:else}
		<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
			<circle class="track" cx="10" cy="10" r={RADIUS} />
			{#if share !== null}
				<circle class="arc" cx="10" cy="10" r={RADIUS} stroke-dasharray="{Math.max(share, 0.02) * CIRCUMFERENCE} {CIRCUMFERENCE}" />
			{/if}
		</svg>
	{/if}
</span>

<style>
	.usage {
		display: grid;
		height: 20px;
		width: 20px;
		flex: none;
		place-items: center;
		color: var(--tone);
	}

	circle {
		fill: none;
		stroke-width: 3;
	}

	.track {
		stroke: color-mix(in oklab, var(--tone) 26%, transparent);
	}

	.arc {
		stroke: var(--tone);
		stroke-linecap: round;
		transform: rotate(-90deg);
		transform-origin: center;
		transition: stroke-dasharray 300ms var(--ease);
	}
</style>
