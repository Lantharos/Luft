<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { tooltip } from '@luft/ui';
	import type { Operation } from '$lib/bridge/types';
	import { activity, percent } from '$lib/format';
	import { operations } from '$lib/state/operations.svelte';

	let { operation, large = false }: { operation: Operation; large?: boolean } = $props();
	const value = $derived(percent(operation));

	$effect(() => operations.showInline(operation.id));
</script>

<div class="progress" class:large role="progressbar" aria-label={operation.title} aria-valuenow={value ?? undefined} aria-valuemin={0} aria-valuemax={100}>
	<span class="fill" class:indeterminate={value === null} style:width={value === null ? undefined : `${value}%`}></span>
	<span class="label">{activity(operation)}{value === null ? '…' : ` ${value}%`}</span>
	<button type="button" class="cancel" aria-label="Cancel" {@attach tooltip('Cancel')} onclick={() => operations.cancel(operation.id)}>
		<X size={14} />
	</button>
</div>

<style>
	.progress {
		position: relative;
		display: flex;
		height: 36px;
		min-width: 168px;
		align-items: center;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding-inline: 14px 4px;
		font-size: 13px;
		font-weight: 500;
	}

	.progress.large {
		height: 40px;
		min-width: 200px;
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--accent-soft);
		transition: width 240ms var(--ease);
	}

	.fill.indeterminate {
		width: 30%;
		animation: slide 1.4s var(--ease) infinite;
	}

	.label {
		position: relative;
		flex: 1;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.cancel {
		position: relative;
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition: background-color 160ms var(--ease), color 160ms var(--ease);
	}

	.cancel:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(340%);
		}
	}
</style>
