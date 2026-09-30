<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { fly } from 'svelte/transition';
	import { notices } from '$lib/state/notices.svelte';
</script>

{#if notices.current}
	{#key notices.current.id}
		<div class="notice" role="status" transition:fly={{ y: 12, duration: 220 }}>
			<span class="min-w-0 flex-1">{notices.current.message}</span>
			<button type="button" class="icon-button" aria-label="Dismiss" onclick={() => notices.dismiss()}>
				<X size={15} />
			</button>
		</div>
	{/key}
{/if}

<style>
	.notice {
		position: fixed;
		bottom: 20px;
		left: calc(var(--sidebar-width) + (100vw - var(--sidebar-width)) / 2);
		z-index: 60;
		display: flex;
		max-width: 460px;
		align-items: center;
		gap: 10px;
		padding: 6px 6px 6px 16px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		box-shadow: 0 12px 36px var(--shadow-soft);
		font-size: 13px;
		translate: -50% 0;
	}
</style>
