<script lang="ts">
	import { statusMarker } from '$lib/vcs/format';
	import type { VcsFileStatus } from '$lib/vcs/types';

	interface Props {
		status: VcsFileStatus | null;
		density?: 'list' | 'grid';
	}

	let { status, density = 'list' }: Props = $props();
</script>

{#if status && status !== 'ignored'}
	<span class={['vcs-badge', `vcs-badge--${status}`, density === 'grid' ? 'vcs-badge--grid' : '']} aria-label={status}>
		{statusMarker(status)}
	</span>
{/if}

<style>
	.vcs-badge {
		display: inline-grid;
		height: 18px;
		min-width: 18px;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 999px;
		padding-inline: 5px;
		background: color-mix(in oklab, var(--ink) 8%, transparent);
		color: var(--text-soft);
		font-size: 10px;
		font-weight: 650;
		line-height: 1;
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 10%, transparent);
	}

	.vcs-badge--grid {
		position: absolute;
		right: 12px;
		top: 10px;
	}

	.vcs-badge--added,
	.vcs-badge--untracked {
		background: color-mix(in oklab, var(--success) 14%, transparent);
		color: var(--success);
	}

	.vcs-badge--deleted,
	.vcs-badge--conflicted {
		background: color-mix(in oklab, var(--danger) 14%, transparent);
		color: var(--danger);
	}

	.vcs-badge--renamed {
		background: color-mix(in oklab, var(--media) 16%, transparent);
		color: var(--media);
	}
</style>
