<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { ProgressBar, tooltip } from '@luft/ui';
	import type { Operation } from '#lib/bindings.js';
	import { activity, percent } from '#lib/format.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { operation, large = false }: { operation: Operation; large?: boolean } = $props();
	const value = $derived(percent(operation));

	$effect(() => operations.showInline(operation.id));
</script>

<div class="progress" class:large>
	<ProgressBar fraction={operation.progress?.fraction ?? null} label={operation.title} class="absolute inset-0 h-auto rounded-none bg-transparent [--progress-color:var(--accent-soft)]" />
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
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.cancel:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
