<script lang="ts">
	import { fly } from 'svelte/transition';
	import { chrome } from '$lib/app/chrome.svelte';
</script>

{#if chrome.toast}
	{#key chrome.toast.id}
		<div class="toast" role="status" transition:fly={{ y: 12, duration: 200 }}>{chrome.toast.text}</div>
	{/key}
{/if}

<style>
	.toast {
		position: absolute;
		bottom: 28px;
		left: 50%;
		z-index: 40;
		translate: -50% 0;
		border-radius: var(--radius-pill);
		background: var(--popover);
		padding: 9px 16px;
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		box-shadow: 0 10px 32px var(--shadow-soft);
		pointer-events: none;
	}
</style>
