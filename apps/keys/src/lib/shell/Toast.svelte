<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toast } from '$lib/state/toast.svelte';
</script>

{#if toast.current}
	{#key toast.current.id}
		<div class="toast" role="status" transition:fly={{ y: 12, duration: 200 }}>{toast.current.text}</div>
	{/key}
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 28px;
		left: 50%;
		z-index: 40;
		translate: -50% 0;
		max-width: calc(100vw - 80px);
		border-radius: var(--radius-pill);
		background: var(--popover);
		padding: 9px 16px;
		color: var(--text);
		font-size: 13px;
		font-weight: 500;
		box-shadow: 0 10px 32px var(--shadow-soft);
		pointer-events: none;
	}
</style>
