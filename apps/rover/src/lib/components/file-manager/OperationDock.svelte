<script lang="ts">
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import Icon from '$lib/components/Icon.svelte';
	import { isTauriRuntime } from '$lib/runtime';
	import type { Operation, QueueStatus } from '$lib/types';
	import { formatBytes } from '$lib/utils';

	let queue = $state<QueueStatus | null>(null);
	let now = $state(Math.floor(Date.now() / 1000));

	const activeStatuses = new Set(['Pending', 'InProgress', 'Paused']);

	let visibleOperations = $derived(
		(queue?.operations ?? [])
			.filter((operation) => activeStatuses.has(operation.status) || !operation.completed_at || now - operation.completed_at < 2)
			.slice(0, 4)
	);

	onMount(() => {
		if (!isTauriRuntime()) return;
		void refreshQueue();
		const interval = window.setInterval(() => {
			now = Math.floor(Date.now() / 1000);
			void refreshQueue();
		}, 500);
		return () => window.clearInterval(interval);
	});

	async function refreshQueue() {
		try {
			queue = await api.getQueueStatus();
		} catch {
			queue = null;
		}
	}

	function operationTitle(operation: Operation) {
		if (operation.status === 'Completed') {
			if (operation.op_type === 'Copy') return 'Copied';
			if (operation.op_type === 'Move') return 'Moved';
			if (operation.op_type === 'Trash') return 'Moved to trash';
			return 'Deleted';
		}
		if (operation.op_type === 'Copy') return 'Copying';
		if (operation.op_type === 'Move') return 'Moving';
		if (operation.op_type === 'Trash') return 'Moving to trash';
		return 'Deleting';
	}

	function fileName(operation: Operation) {
		if (!activeStatuses.has(operation.status)) return operation.status === 'Failed' ? 'Failed' : 'Done';
		return operation.current_file?.split('/').filter(Boolean).at(-1) ?? 'Preparing';
	}

	function progressPercent(operation: Operation) {
		return `${Math.max(2, Math.round(operation.progress * 100))}%`;
	}

	function progressText(operation: Operation) {
		if (operation.status === 'Completed') return operation.total_items === 1 ? 'Finished' : `${operation.total_items} items finished`;
		if (operation.status === 'Failed') return operation.error ?? 'Failed';
		if (operation.status === 'Cancelled') return 'Cancelled';
		if (operation.total_bytes > 0) {
			return `${formatBytes(operation.bytes_processed)} of ${formatBytes(operation.total_bytes)}`;
		}
		return `${operation.items_processed} of ${operation.total_items || operation.sources.length} items`;
	}
</script>

{#if visibleOperations.length > 0}
	<div class="pointer-events-none absolute bottom-4 right-4 z-40 flex w-[360px] max-w-[calc(100%-32px)] flex-col gap-2">
		{#each visibleOperations as operation (operation.id)}
			<section
				class="pointer-events-auto rounded-[18px] bg-[rgba(28,28,25,0.86)] p-3 text-[13px] shadow-[0_20px_60px_var(--shadow-soft),inset_0_1px_0_var(--hairline)] backdrop-blur-2xl"
				aria-label={`${operationTitle(operation)} operation`}
			>
				<div class="flex items-center gap-3">
					<div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(245,245,242,0.08)] text-[var(--text-soft)]">
						<Icon name={operation.op_type === 'Delete' ? 'trash-2' : operation.op_type === 'Move' ? 'upload' : 'copy'} size={17} />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between gap-3 text-[var(--text)]">
							<span class="truncate">{operationTitle(operation)}</span>
							<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{Math.round(operation.progress * 100)}%</span>
						</div>
						<div class="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">{fileName(operation)}</div>
					</div>
				</div>
				<div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(245,245,242,0.08)]">
					<div class="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200" style:width={progressPercent(operation)}></div>
				</div>
				<div class="mt-2 flex items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
					<span class="min-w-0 truncate">{progressText(operation)}</span>
					<div class="flex shrink-0 items-center gap-1">
						{#if operation.status === 'InProgress'}
							<button class="tool-button h-8 min-h-8 w-8 min-w-8" type="button" aria-label="Pause operation" onclick={() => api.pauseOperation(operation.id)}>
								<Icon name="pause" size={14} />
							</button>
						{:else if operation.status === 'Paused'}
							<button class="tool-button h-8 min-h-8 w-8 min-w-8" type="button" aria-label="Resume operation" onclick={() => api.resumeOperation(operation.id)}>
								<Icon name="play" size={14} />
							</button>
						{/if}
						{#if activeStatuses.has(operation.status)}
							<button class="tool-button h-8 min-h-8 w-8 min-w-8" type="button" aria-label="Cancel operation" onclick={() => api.cancelOperation(operation.id)}>
								<Icon name="x" size={14} />
							</button>
						{/if}
					</div>
				</div>
			</section>
		{/each}
	</div>
{/if}
