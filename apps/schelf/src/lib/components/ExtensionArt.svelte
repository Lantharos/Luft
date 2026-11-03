<script lang="ts">
	import Puzzle from '@lucide/svelte/icons/puzzle';

	let { art, icon, height = null }: { art: string | null; icon: string | null; height?: number | null } = $props();

	let artBroken = $state(false);
	let iconBroken = $state(false);

	$effect(() => {
		void art;
		artBroken = false;
	});

	$effect(() => {
		void icon;
		iconBroken = false;
	});

	const pictured = $derived(art !== null && !artBroken);
</script>

<span class="extension-art" style:height={height ? `${height}px` : null}>
	{#if pictured}
		<img class="picture" src={art} alt="" loading="lazy" decoding="async" onerror={() => (artBroken = true)} />
	{/if}
	<span class="icon" class:corner={pictured}>
		{#if icon && !iconBroken}
			<img src={icon} alt="" loading="lazy" decoding="async" onerror={() => (iconBroken = true)} />
		{:else}
			<Puzzle size="50%" />
		{/if}
	</span>
</span>

<style>
	.extension-art {
		position: relative;
		display: block;
		flex: none;
		aspect-ratio: 2 / 1;
		overflow: hidden;
		border-radius: min(11%, 22px) / min(22%, 22px);
		background: var(--well);
		container-type: size;
	}

	.picture {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.icon {
		position: absolute;
		inset: 0;
		display: grid;
		width: 54cqh;
		height: 54cqh;
		margin: auto;
		place-items: center;
		border-radius: 24%;
		color: var(--text-muted);
	}

	.icon.corner {
		inset: auto auto 11% 5.5%;
		width: 42cqh;
		height: 42cqh;
		margin: 0;
		filter: drop-shadow(0 4px 10px rgb(0 0 0 / 0.35));
	}

	.icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
