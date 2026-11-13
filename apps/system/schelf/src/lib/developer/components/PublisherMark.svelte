<script lang="ts">
	import type { DashboardPublisher } from '../store';

	let { publisher, size = 28 }: { publisher: DashboardPublisher; size?: number } = $props();
	const initials = $derived(
		publisher.name
			.split(/\s+/)
			.slice(0, 2)
			.map((word) => word.charAt(0).toUpperCase())
			.join('')
	);
</script>

<span class="mark" style:width="{size}px" style:height="{size}px" style:font-size="{size * 0.38}px">
	{#if publisher.logo}
		<img src={publisher.logo} alt="" />
	{:else}
		{initials}
	{/if}
</span>

<style>
	.mark {
		display: grid;
		flex: none;
		place-items: center;
		overflow: hidden;
		border-radius: 30%;
		background: var(--control);
		font-weight: 600;
		color: var(--text-soft);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
