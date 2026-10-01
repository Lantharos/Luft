<script lang="ts">
	import { fly } from 'svelte/transition';
	import { history } from '$lib/features/history.svelte';

	let toast = $derived(history.toast);
	let action = $derived.by(() => {
		if (!toast || toast.kind === 'failed') return null;
		return toast.kind === 'undone' ? { label: 'Redo', run: history.redo } : { label: 'Undo', run: history.undo };
	});

	function run() {
		action?.run();
		history.dismiss();
	}
</script>

{#if toast}
	{#key toast.id}
		<div
			class="toast"
			class:failed={toast.kind === 'failed'}
			role="status"
			onpointerenter={history.hold}
			onpointerleave={history.release}
			transition:fly={{ y: 12, duration: 200 }}
		>
			<span class="min-w-0 truncate">{toast.message}</span>
			{#if action}
				<button class="action" type="button" onclick={run}>{action.label}</button>
			{/if}
		</div>
	{/key}
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 44px;
		left: 50%;
		z-index: 45;
		display: flex;
		max-width: min(520px, calc(100vw - 48px));
		translate: -50% 0;
		align-items: center;
		gap: 14px;
		padding: 6px 6px 6px 16px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 90%, transparent);
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
