<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import type { PlannedStep } from '#lib/systems.js';
	import { Spinner } from '@luft/ui';

	interface Props {
		steps: PlannedStep[];
		current: string | null;
		finished: boolean;
		failed: boolean;
	}

	let { steps, current, finished, failed }: Props = $props();

	let reached = $derived(current === null ? -1 : steps.findIndex((step) => step.key === current));

	function state(index: number) {
		if (finished || index < reached) return 'done';
		if (index === reached) return failed ? 'failed' : 'running';
		return 'queued';
	}
</script>

<ol class="row-group">
	{#each steps as step, index (step.key)}
		{@const status = state(index)}
		<li class={['step', status]}>
			<span class="marker" aria-hidden="true">
				{#if status === 'done'}
					<Check size={15} />
				{:else if status === 'running'}
					<Spinner size={15} />
				{:else if status === 'failed'}
					<X size={15} />
				{:else}
					{index + 1}
				{/if}
			</span>
			<span class="min-w-0 flex-1">{step.label}</span>
		</li>
	{/each}
</ol>

<style>
	.step {
		display: flex;
		min-height: 44px;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		font-size: 13.5px;
	}

	.marker {
		display: grid;
		height: 22px;
		width: 22px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--control);
		font-size: 11.5px;
		font-weight: 600;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}

	.done .marker {
		background: color-mix(in oklab, var(--success) 22%, transparent);
		color: var(--success);
	}

	.failed .marker {
		background: color-mix(in oklab, var(--danger) 18%, transparent);
		color: var(--danger);
	}

	.queued {
		color: var(--text-muted);
	}
</style>
