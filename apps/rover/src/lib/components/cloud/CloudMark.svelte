<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import type { FileState } from '#lib/types/cloud.js';

	interface Props {
		state: FileState | undefined;
		density?: 'list' | 'grid';
	}

	let { state, density = 'list' }: Props = $props();

	const MARKS: Record<FileState, { icon: IconName; label: string }> = {
		online: { icon: 'cloud', label: 'Online only, downloads when opened' },
		local: { icon: 'circle-check', label: 'On this device' },
		syncing: { icon: 'refresh', label: 'Syncing' }
	};
</script>

{#if state}
	<span class={['cloud-mark', `cloud-mark--${state}`, density === 'grid' && 'cloud-mark--grid']} aria-label={MARKS[state].label} {@attach tooltip(MARKS[state].label)}>
		<Icon name={MARKS[state].icon} size={density === 'grid' ? 15 : 14} class={state === 'syncing' ? 'animate-spin' : ''} />
	</span>
{/if}

<style>
	.cloud-mark {
		display: inline-grid;
		flex: 0 0 auto;
		place-items: center;
		color: var(--text-muted);
	}

	.cloud-mark--local {
		color: var(--success);
	}

	.cloud-mark--syncing {
		color: var(--accent);
	}

	.cloud-mark--grid {
		position: absolute;
		left: 12px;
		bottom: 8px;
	}
</style>
