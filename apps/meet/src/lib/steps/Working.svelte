<script lang="ts">
	import { bytes } from '@luft/ui';
	import type { Stage } from '#lib/api/meet.js';
	import { session } from '#lib/state/meet.svelte.js';

	const TITLES: Record<Stage, [string, string]> = {
		shrinking: ['Making room', 'Windows is moving its files to make space. This can take a few minutes.'],
		partitioning: ['Setting up Luft’s space', 'Preparing the partitions Luft starts from.'],
		downloading: ['Bringing Luft over', 'Luft is copied straight into its own space and checked on the way.'],
		packing: ['Packing your things', 'Copying everything you chose into the moving box. Big folders take a while.'],
		removing: ['Removing Luft', 'Giving the space back to Windows.']
	};
	const LINUX_REMOVING: [string, string] = ['Removing Luft', 'Taking out its files and its start entry.'];

	let progress = $derived(session.progress);
	let stage = $derived(progress?.stage ?? 'shrinking');
	let title = $derived(stage === 'removing' && session.platform === 'linux' ? LINUX_REMOVING : TITLES[stage]);
	let fraction = $derived(progress && progress.total > 0 ? progress.done / progress.total : 0);
	let measured = $derived(!!progress && progress.total > 0 && (progress.stage === 'downloading' || progress.stage === 'packing'));
</script>

<section class="flex h-full flex-col justify-center px-14">
	<h1 class="text-[30px] leading-tight font-semibold">{title[0]}</h1>
	<p class="mt-2 max-w-[520px] text-[15px] leading-relaxed text-[var(--text-soft)]">{title[1]}</p>
	<div class="mt-9 flex flex-col gap-3" role="progressbar" aria-valuenow={Math.round(fraction * 100)} aria-label={title[0]}>
		<div class="track" class:waiting={!progress || (!measured && fraction < 1)}>
			<div class="fill progress-fill" style:--progress={Math.max(fraction, 0.02)}></div>
		</div>
		<span class="text-[13px] text-[var(--text-muted)]">
			{#if measured && progress}
				{bytes(progress.done)} of {bytes(progress.total)}
			{:else}
				Please keep this window open.
			{/if}
		</span>
	</div>
</section>

<style>
	.track {
		height: 8px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--surface-hover);
	}

	.fill {
		height: 100%;
		border-radius: inherit;
		background: var(--accent);
	}

	.waiting .fill {
		width: 30%;
		translate: none;
		animation: drift 1.6s var(--ease) infinite;
	}

	@keyframes drift {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(340%);
		}
	}
</style>
