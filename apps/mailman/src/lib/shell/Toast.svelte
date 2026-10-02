<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from './toasts.svelte';

	let toast = $derived(toasts.current);
</script>

{#if toast}
	{#key toast.id}
		<div
			class="toast"
			class:failed={toast.failed}
			role="status"
			onpointerenter={toasts.hold}
			onpointerleave={toasts.release}
			transition:fly={{ y: 12, duration: 200 }}
		>
			<span class="min-w-0 truncate">{toast.message}</span>
			{#if toast.action}
				<button class="action" type="button" onclick={toasts.run}>{toast.action.label}</button>
			{/if}
		</div>
	{/key}
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 24px;
		left: calc(var(--sidebar-width) + 24px);
		z-index: 45;
		display: flex;
		max-width: min(520px, calc(100vw - 48px));
		align-items: center;
		gap: 14px;
		padding: 6px 6px 6px 16px;
		min-height: 42px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 92%, transparent);
		box-shadow: 0 16px 48px var(--shadow-soft), inset 0 1px 0 var(--hairline);
		backdrop-filter: blur(24px);
		font-size: 13px;
		color: var(--text-soft);
	}

	.failed {
		padding-right: 16px;
		color: var(--danger);
	}

	.action {
		flex: none;
		min-height: 30px;
		padding-inline: 12px;
		border-radius: var(--radius-pill);
		font-weight: 500;
		color: var(--accent);
		transition: background-color 160ms var(--ease);
	}

	.action:hover {
		background: var(--surface-hover);
	}
</style>
