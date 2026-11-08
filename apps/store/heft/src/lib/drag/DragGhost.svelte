<script lang="ts">
	import { drag } from './drag.svelte';
</script>

{#if drag.payload}
	<div class="ghost" style:transform="translate({drag.x + 14}px, {drag.y + 10}px)">{drag.label}</div>
{/if}

<style>
	.ghost {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 50;
		max-width: 240px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--popover);
		padding: 7px 14px;
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		text-overflow: ellipsis;
		box-shadow: 0 10px 30px var(--shadow-soft);
		pointer-events: none;
	}
</style>
