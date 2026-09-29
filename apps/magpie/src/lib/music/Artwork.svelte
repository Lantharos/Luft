<script lang="ts">
	import Music from '@lucide/svelte/icons/music';
	import { fileSource } from '$lib/bridge';

	let { art, size, radius = 12 }: { art: string | null; size: number; radius?: number } = $props();

	let broken = $state(false);

	$effect(() => {
		void art;
		broken = false;
	});
</script>

<div class="artwork" style:width="{size}px" style:height="{size}px" style:border-radius="{radius}px">
	{#if art && !broken}
		<img src={fileSource(art)} alt="" draggable="false" decoding="async" onerror={() => (broken = true)} />
	{:else}
		<Music size={Math.round(size * 0.36)} />
	{/if}
</div>

<style>
	.artwork {
		display: grid;
		flex: none;
		place-items: center;
		overflow: hidden;
		background: var(--surface-hover);
		color: var(--text-muted);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}
</style>
