<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';

	interface Props {
		picture: string | null;
		name: string;
		size: number;
		version?: number;
	}

	let { picture, name, size, version = 0 }: Props = $props();

	let initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((word) => word[0].toUpperCase())
			.join('')
	);
</script>

<span class="avatar" style:width="{size}px" style:height="{size}px" style:font-size="{size * 0.38}px">
	{#if picture}
		<img src="{fileUrl(picture)}?v={version}" alt="" decoding="async" />
	{:else}
		{initials}
	{/if}
</span>

<style>
	.avatar {
		display: grid;
		flex: none;
		place-items: center;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--control);
		font-weight: 600;
		color: var(--text-soft);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}
</style>
