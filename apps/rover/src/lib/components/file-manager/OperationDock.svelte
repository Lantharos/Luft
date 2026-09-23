<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import * as api from '$lib/api';
	import Icon from '$lib/components/Icon.svelte';
	import { isDesktopRuntime } from '$lib/runtime';
	import type { Operation, OperationStatus, QueueStatus } from '$lib/types';
	import { formatBytes } from '$lib/utils';

	let queue = $state<QueueStatus | null>(null);
	let now = $state(Date.now());

	const activeStatuses: OperationStatus[] = ['Pending', 'InProgress', 'Paused'];
	const attentionDelay = 650;
	const completedLinger = 2500;
	const safeToEjectLinger = 8000;
	const firstSeenAt = new SvelteMap<string, number>();
	const shownOperations = new SvelteSet<string>();

	let visibleOperations = $derived(
		(queue?.operations ?? [])
			.filter((operation) => shouldRenderOperation(operation))
			.slice(0, 4)
	);

	onMount(() => {
		if (!isDesktopRuntime()) return;
		void refreshQueue();
		const interval = window.setInterval(() => {
			now = Date.now();
			void refreshQueue();
		}, 500);
		return () => window.clearInterval(interval);
	});

	async function refreshQueue() {
		try {
			const nextQueue = await api.getQueueStatus();
			rememberOperationVisibility(nextQueue.operations, now);
			queue = nextQueue;
		} catch {
			queue = null;
		}
	}

	function rememberOperationVisibility(operations: Operation[], timestamp: number) {
		const liveIds = operations.map((operation) => operation.id);
		for (const operation of operations) {
			if (!firstSeenAt.has(operation.id)) firstSeenAt.set(operation.id, operation.started_at ? operation.started_at * 1000 : timestamp);
			if (operation.status === 'Failed' || operation.status === 'Cancelled' || operationRanLongEnough(operation, timestamp)) {
				shownOperations.add(operation.id);
			}
		}
		for (const id of firstSeenAt.keys()) {
			if (liveIds.includes(id)) continue;
			firstSeenAt.delete(id);
			shownOperations.delete(id);
		}
	}

	function operationRanLongEnough(operation: Operation, timestamp: number) {
		const started = operation.started_at ? operation.started_at * 1000 : (firstSeenAt.get(operation.id) ?? timestamp);
		const ended = operation.completed_at ? operation.completed_at * 1000 : timestamp;
		return ended - started >= attentionDelay;
	}

	function shouldRenderOperation(operation: Operation) {
		if (isActiveStatus(operation.status)) return shownOperations.has(operation.id);
		if (operation.status === 'Completed') return shownOperations.has(operation.id) && completedRecently(operation);
		return shownOperations.has(operation.id) && completedRecently(operation);
	}

	function isActiveStatus(status: OperationStatus) {
		return activeStatuses.includes(status);
	}

	function completedRecently(operation: Operation) {
		const linger = operation.phase === 'SafeToEject' ? safeToEjectLinger : completedLinger;
		return !operation.completed_at || now - operation.completed_at * 1000 < linger;
	}

	function operationTitle(operation: Operation) {
		if (operation.status === 'Completed') {
			if (operation.phase === 'SafeToEject') return 'Safe to eject';
			if (operation.op_type === 'Copy') return 'Copied';
			if (operation.op_type === 'Move') return 'Moved';
			if (operation.op_type === 'Trash') return 'Moved to trash';
			return 'Deleted';
		}
		if (operation.phase === 'Finalizing') return `Finalizing writes${destinationText(operation)}`;
		if (operation.phase === 'Preparing') return 'Preparing';
		if (operation.op_type === 'Copy') return `Copying${destinationText(operation)}`;
		if (operation.op_type === 'Move') return `Moving${destinationText(operation)}`;
		if (operation.op_type === 'Trash') return 'Moving to trash';
		return 'Deleting';
	}

	function destinationText(operation: Operation) {
		if (!operation.destination_label) return '';
		return ` to ${operation.destination_label}`;
	}

	function operationIcon(operation: Operation): 'trash-2' | 'upload' | 'copy' | 'check' | 'usb' {
		if (operation.phase === 'SafeToEject') return 'check';
		if (operation.phase === 'Finalizing' && operation.destination_is_removable) return 'usb';
		if (operation.op_type === 'Delete' || operation.op_type === 'Trash') return 'trash-2';
		if (operation.op_type === 'Move') return 'upload';
		return 'copy';
	}

	function fileName(operation: Operation) {
		if (!isActiveStatus(operation.status)) return operation.status === 'Failed' ? 'Failed' : 'Done';
		if (operation.phase === 'Finalizing') return operation.destination_is_removable ? 'Do not unplug yet' : 'Finishing writes';
		return operation.current_file?.split('/').filter(Boolean).at(-1) ?? 'Preparing';
	}

	function progressPercent(operation: Operation) {
		return `${Math.max(2, Math.round(operation.progress * 100))}%`;
	}

	function progressText(operation: Operation) {
		if (operation.status === 'Completed') {
			if (operation.phase === 'SafeToEject') return operation.op_type === 'Move' ? 'Moved successfully' : 'Copied successfully';
			return operation.total_items === 1 ? 'Finished' : `${operation.total_items} items finished`;
		}
		if (operation.status === 'Failed') return operation.error ?? 'Failed';
		if (operation.status === 'Cancelled') return 'Cancelled';
		if (operation.phase === 'Finalizing') return operation.destination_is_removable ? 'Finalizing writes. Do not unplug yet.' : 'Finalizing writes';
		if (operation.total_bytes > 0) {
			return [
				`${formatBytes(operation.bytes_processed)} of ${formatBytes(operation.total_bytes)}`,
				speedText(operation),
				etaText(operation)
			]
				.filter(Boolean)
				.join(' · ');
		}
		return `${operation.items_processed} of ${operation.total_items || operation.sources.length} items`;
	}

	function speedBytesPerSecond(operation: Operation) {
		if (operation.status !== 'InProgress' || operation.phase === 'Finalizing') return 0;
		if (!operation.started_at || operation.bytes_processed <= 0) return 0;
		const elapsedSeconds = Math.max(0.75, (now - operation.started_at * 1000) / 1000);
		return operation.bytes_processed / elapsedSeconds;
	}

	function speedText(operation: Operation) {
		const speed = speedBytesPerSecond(operation);
		return speed > 0 ? `${formatBytes(speed)}/s` : '';
	}

	function etaText(operation: Operation) {
		const speed = speedBytesPerSecond(operation);
		if (speed <= 0 || operation.total_bytes <= operation.bytes_processed) return '';
		return `${formatDuration((operation.total_bytes - operation.bytes_processed) / speed)} left`;
	}

	function formatDuration(seconds: number) {
		const rounded = Math.max(1, Math.round(seconds));
		const minutes = Math.floor(rounded / 60);
		const remainingSeconds = rounded % 60;
		if (minutes < 1) return `${rounded}s`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		if (hours < 1) return `${minutes}m ${remainingSeconds}s`;
		return `${hours}h ${remainingMinutes}m`;
	}
</script>

{#if visibleOperations.length > 0}
	<div class="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[360px] max-w-[calc(100%-32px)] flex-col gap-2">
		{#each visibleOperations as operation (operation.id)}
			<section
				class="pointer-events-auto rounded-[18px] bg-[rgba(28,28,25,0.86)] p-3 text-[13px] shadow-[0_20px_60px_var(--shadow-soft),inset_0_1px_0_var(--hairline)] backdrop-blur-2xl"
				aria-label={`${operationTitle(operation)} operation`}
			>
				<div class="flex items-center gap-3">
					<div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(245,245,242,0.08)] text-[var(--text-soft)]">
						<Icon name={operationIcon(operation)} size={17} />
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
						{#if isActiveStatus(operation.status)}
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
