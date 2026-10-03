<script lang="ts">
	import { disks } from '$lib/state/disks.svelte';
</script>

{#if disks.notice}
	<div class="notice" role="status">
		<span class="min-w-0 flex-1">{disks.notice}</span>
		<button type="button" class="plain-button" onclick={() => (disks.notice = null)}>Dismiss</button>
	</div>
{/if}

<style>
	.notice {
		position: fixed;
		right: 24px;
		bottom: 24px;
		display: flex;
		max-width: min(520px, calc(100vw - 48px));
		align-items: center;
		gap: 12px;
		border-radius: 20px;
		background: var(--popover);
		padding: 10px 10px 10px 18px;
		font-size: 13px;
		box-shadow: 0 16px 48px var(--shadow-soft);
		animation: rise 220ms var(--ease);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
</style>
