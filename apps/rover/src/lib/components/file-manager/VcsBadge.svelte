<script lang="ts">
	import { statusMarker } from '$lib/vcs/format';
	import type { VcsFileStatus } from '$lib/vcs/types';

	interface Props {
		status: VcsFileStatus | null;
		density?: 'list' | 'grid';
	}

	let { status, density = 'list' }: Props = $props();
</script>

{#if status && status !== 'clean' && status !== 'ignored'}
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
		background: rgba(245, 245, 242, 0.08);
		color: var(--text-soft);
		font-size: 10px;
		font-weight: 650;
		line-height: 1;
		box-shadow: inset 0 0 0 1px rgba(245, 245, 242, 0.1);
	}

	.vcs-badge--grid {
		position: absolute;
		right: 12px;
		top: 10px;
	}

	.vcs-badge--added,
	.vcs-badge--untracked {
		background: rgba(166, 201, 168, 0.14);
		color: var(--success);
	}

	.vcs-badge--deleted,
	.vcs-badge--conflicted {
		background: rgba(224, 170, 170, 0.14);
		color: var(--danger);
	}

	.vcs-badge--renamed {
		background: rgba(159, 183, 181, 0.16);
		color: var(--media);
	}
</style>
