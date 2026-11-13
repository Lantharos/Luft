<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import { problemText } from '../state/act';
	import type { Resource } from '../state/resource.svelte';

	interface Props {
		resource: Resource<T>;
		children: Snippet<[T]>;
		placeholder?: Snippet;
	}

	let { resource, children, placeholder }: Props = $props();
</script>

{#if resource.data !== null}
	{#if resource.problem?.state === 'offline'}
		<p class="offline"><CloudOff size={14} />Offline, showing what Schelf read last</p>
	{/if}
	{@render children(resource.data)}
{:else if resource.problem}
	<div class="flex flex-col items-center gap-4 px-8 pt-24 text-center">
		<p class="max-w-[420px] text-[14px] text-[var(--text-muted)]">{problemText(resource.problem)}</p>
		{#if resource.problem.state !== 'signedOut'}
			<button type="button" class="button" disabled={resource.loading} onclick={() => resource.refresh()}>Try again</button>
		{/if}
	</div>
{:else if placeholder}
	{@render placeholder()}
{:else}
	<div class="flex flex-col gap-3">
		<div class="skeleton h-24 w-full"></div>
		<div class="skeleton h-40 w-full"></div>
	</div>
{/if}

<style>
	.offline {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 6px;
		font-size: 12.5px;
		color: var(--text-muted);
	}
</style>
