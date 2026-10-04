<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import X from '@lucide/svelte/icons/x';
	import { percent } from '#lib/format.js';
	import { editor } from '#lib/editor/editor.svelte.js';

	type State = 'queued' | 'running' | 'done' | 'failed' | 'skipped';

	let sentences = $derived(editor.frozen?.sentences ?? editor.outcome?.sentences ?? []);
	let states = $derived(
		sentences.map((_, index): State => {
			if (editor.progress) return index < editor.progress.index ? 'done' : index === editor.progress.index ? 'running' : 'queued';
			const outcome = editor.outcome;
			if (!outcome) return 'queued';
			if (index < outcome.done) return 'done';
			return index === outcome.done && outcome.error ? 'failed' : 'skipped';
		})
	);
	let moving = $derived(editor.progress && editor.progress.total > 0 ? editor.progress.copied / editor.progress.total : null);
	let heading = $derived(editor.running ? 'Applying changes' : editor.outcome?.error ? 'Some changes weren’t made' : 'All changes were made');
</script>

{#if sentences.length}
	<section class="flex flex-col gap-3">
		<h2 class="px-1 text-[15px] font-semibold">{heading}</h2>
		<ol class="row-group">
			{#each sentences as sentence, index (index)}
				<li class={['step', states[index]]}>
					<span class="marker" aria-hidden="true">
						{#if states[index] === 'done'}
							<Check size={15} />
						{:else if states[index] === 'running'}
							<LoaderCircle size={15} class="animate-spin" />
						{:else if states[index] === 'failed'}
							<X size={15} />
						{:else}
							{index + 1}
						{/if}
					</span>
					<span class="flex-1">{sentence}</span>
					{#if states[index] === 'running' && moving !== null}
						<span class="text-[12.5px] text-[var(--text-muted)] tabular-nums">{percent(moving)}</span>
					{/if}
				</li>
			{/each}
		</ol>
		{#if editor.outcome?.error}
			<p class="px-1 text-[13px] text-[var(--danger)]">{editor.outcome.error}</p>
		{/if}
	</section>
{/if}

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

	.skipped {
		color: var(--text-muted);
	}
</style>
