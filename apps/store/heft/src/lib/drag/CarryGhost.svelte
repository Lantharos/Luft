<script lang="ts">
	import { carry } from './carry.svelte';
</script>

{#if carry.item}
	<div class="ghost" style:transform="translate({carry.x + 12}px, {carry.y + 12}px)">
		{#if carry.preview}
			<img src={carry.preview} alt="" />
		{:else if carry.item.kind === 'text'}
			<blockquote>{carry.item.text}</blockquote>
		{/if}
	</div>
{/if}

<style>
	.ghost {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 50;
		max-width: 260px;
		overflow: hidden;
		border-radius: 14px;
		background: var(--popover);
		padding: 8px;
		box-shadow: 0 14px 40px var(--shadow-soft);
		pointer-events: none;
		opacity: 0.96;
	}

	img {
		display: block;
		max-height: 200px;
		max-width: 244px;
		border-radius: 6px;
	}

	blockquote {
		display: -webkit-box;
		overflow: hidden;
		border-left: 3px solid var(--accent);
		padding: 2px 10px;
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-soft);
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
	}
</style>
