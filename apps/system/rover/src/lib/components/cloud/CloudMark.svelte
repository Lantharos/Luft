<script lang="ts">
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Cloud from '@lucide/svelte/icons/cloud';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import type { Component } from 'svelte';
	import type { FileState } from '#lib/bindings.js';

	interface Props {
		state: FileState | undefined;
		density?: 'list' | 'grid';
	}

	let { state, density = 'list' }: Props = $props();

	const MARKS: Record<FileState, { icon: Component; label: string }> = {
		online: { icon: Cloud, label: 'rover-cloud-mark-online' },
		local: { icon: CircleCheck, label: 'rover-cloud-mark-local' },
		syncing: { icon: RefreshCw, label: 'rover-cloud-mark-syncing' }
	};
</script>

{#if state}
	{@const Icon = MARKS[state].icon}
	<span class={['cloud-mark', `cloud-mark--${state}`, density === 'grid' && 'cloud-mark--grid']} aria-label={t(MARKS[state].label)} {@attach tooltip(t(MARKS[state].label))}>

		<Icon size={density === 'grid' ? 15 : 14} class={state === 'syncing' ? 'animate-spin' : ''} />
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
