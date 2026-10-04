<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Popover } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';

	let button = $state<HTMLButtonElement>();
	let open = $state(false);

	let count = $derived(editor.described.length);
</script>

<button
	bind:this={button}
	type="button"
	class={['plan', open && 'open']}
	aria-haspopup="dialog"
	aria-expanded={open}
	onclick={() => (open = !open)}
>
	{count === 1 ? '1 change' : `${count} changes`}
	<ChevronDown size={15} />
</button>

{#if open && button}
	<Popover anchor={button} label="Planned changes" role="dialog" align="end" minWidth={340} maxHeight={420} onclose={() => (open = false)}>
		<ol class="flex flex-col">
			{#each editor.described as step, index (index)}
				<li class="step">
					<span class="number">{index + 1}</span>
					<span>{step.sentence}</span>
				</li>
			{/each}
		</ol>
	</Popover>
{/if}

<style>
	.plan {
		display: inline-flex;
		height: 32px;
		align-items: center;
		gap: 4px;
		border-radius: var(--radius-pill);
		padding: 0 8px 0 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
		transition:
			background-color 160ms var(--ease),
			color 160ms var(--ease);
	}

	.plan:hover,
	.plan.open {
		background: var(--surface-hover);
		color: var(--text);
	}

	.plan :global(svg) {
		color: var(--text-muted);
		transition: transform 200ms var(--ease);
	}

	.plan.open :global(svg) {
		transform: rotate(180deg);
	}

	.step {
		display: flex;
		gap: 10px;
		padding: 8px 10px;
		font-size: 13px;
		line-height: 1.45;
	}

	.number {
		width: 14px;
		flex: none;
		text-align: right;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
