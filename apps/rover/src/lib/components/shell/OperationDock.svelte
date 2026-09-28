<script lang="ts">
	import * as api from '$lib/api';
	import Icon from '$lib/components/Icon.svelte';
	import type { Operation } from '$lib/types';
	import { formatBytes, formatDuration, plural } from '$lib/utils/format';
	import { basename } from '$lib/utils/paths';

	interface Props {
		operations: Operation[];
	}

	let { operations }: Props = $props();

	const ATTENTION_DELAY_MS = 650;
	const COMPLETED_LINGER_MS = 2500;
	const SAFE_TO_EJECT_LINGER_MS = 8000;
	const TICK_MS = 500;

	let now = $state(Date.now());
	let visible = $derived(operations.filter(shouldShow).slice(0, 4));
	let ticking = $derived(operations.some((operation) => !lingerEnded(operation)));

	$effect(() => {
		if (!ticking) return;
		now = Date.now();
		const timer = setInterval(() => (now = Date.now()), TICK_MS);
		return () => clearInterval(timer);
	});

	function isActive(operation: Operation) {
		return operation.status === 'InProgress' || operation.status === 'Paused';
	}

	function lingerEnded(operation: Operation) {
		if (operation.completed_at === null) return false;
		const linger = operation.phase === 'SafeToEject' ? SAFE_TO_EJECT_LINGER_MS : COMPLETED_LINGER_MS;
		return now - operation.completed_at >= linger;
	}

	function shouldShow(operation: Operation) {
		if (lingerEnded(operation)) return false;
		if (operation.status === 'Failed' || operation.status === 'Cancelled') return true;
		return (operation.completed_at ?? now) - operation.started_at >= ATTENTION_DELAY_MS;
	}

	function title(operation: Operation) {
		const destination = operation.destination_label ? ` to ${operation.destination_label}` : '';
		if (operation.status === 'Completed') {
			if (operation.phase === 'SafeToEject') return 'Safe to eject';
			return { Copy: 'Copied', Move: 'Moved', Trash: 'Moved to trash', Delete: 'Deleted' }[operation.op_type];
		}
		if (operation.phase === 'Finalizing') return `Finalizing writes${destination}`;
		if (operation.phase === 'Preparing') return 'Preparing';
		return { Copy: `Copying${destination}`, Move: `Moving${destination}`, Trash: 'Moving to trash', Delete: 'Deleting' }[
			operation.op_type
		];
	}

	function icon(operation: Operation): 'trash-2' | 'upload' | 'copy' | 'check' | 'usb' {
		if (operation.phase === 'SafeToEject') return 'check';
		if (operation.phase === 'Finalizing' && operation.destination_is_removable) return 'usb';
		if (operation.op_type === 'Delete' || operation.op_type === 'Trash') return 'trash-2';
		return operation.op_type === 'Move' ? 'upload' : 'copy';
	}

	function subject(operation: Operation) {
		if (!isActive(operation)) return operation.status === 'Failed' ? 'Failed' : 'Done';
		if (operation.phase === 'Finalizing') return operation.destination_is_removable ? 'Do not unplug yet' : 'Finishing writes';
		return operation.current_file ? basename(operation.current_file) : 'Preparing';
	}

	function speed(operation: Operation) {
		if (operation.status !== 'InProgress' || operation.phase === 'Finalizing' || operation.bytes_processed <= 0) return 0;
		return operation.bytes_processed / Math.max(0.75, (now - operation.started_at) / 1000);
	}

	function detail(operation: Operation) {
		if (operation.status === 'Completed') {
			if (operation.phase === 'SafeToEject') return operation.op_type === 'Move' ? 'Moved successfully' : 'Copied successfully';
			return operation.total_items === 1 ? 'Finished' : `${plural(operation.total_items, 'item')} finished`;
		}
		if (operation.status === 'Failed') return operation.error ?? 'Failed';
		if (operation.status === 'Cancelled') return 'Cancelled';
		if (operation.phase === 'Finalizing') {
			return operation.destination_is_removable ? 'Finalizing writes. Do not unplug yet.' : 'Finalizing writes';
		}
		if (operation.total_bytes === 0) return `${operation.items_processed} of ${plural(operation.total_items, 'item')}`;
		const rate = speed(operation);
		const remaining = operation.total_bytes - operation.bytes_processed;
		return [
			`${formatBytes(operation.bytes_processed)} of ${formatBytes(operation.total_bytes)}`,
			rate > 0 && `${formatBytes(rate)}/s`,
			rate > 0 && remaining > 0 && `${formatDuration(remaining / rate)} left`
		]
			.filter(Boolean)
			.join(' · ');
	}
</script>

{#if visible.length > 0}
	<div class="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[360px] max-w-[calc(100%-32px)] flex-col gap-2">
		{#each visible as operation (operation.id)}
			<section
				class="pointer-events-auto rounded-[18px] bg-[rgba(28,28,25,0.86)] p-3 text-[13px] shadow-[0_20px_60px_var(--shadow-soft),inset_0_1px_0_var(--hairline)] backdrop-blur-2xl"
				aria-label={`${title(operation)} operation`}
			>
				<div class="flex items-center gap-3">
					<div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(245,245,242,0.08)] text-[var(--text-soft)]">
						<Icon name={icon(operation)} size={17} />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between gap-3 text-[var(--text)]">
							<span class="truncate">{title(operation)}</span>
							<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{Math.round(operation.progress * 100)}%</span>
						</div>
						<div class="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">{subject(operation)}</div>
					</div>
				</div>
				<div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(245,245,242,0.08)]">
					<div
						class="h-full rounded-full bg-[var(--text)] transition-[width] duration-200"
						style:width={`${Math.max(2, Math.round(operation.progress * 100))}%`}
					></div>
				</div>
				<div class="mt-2 flex items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
					<span class="min-w-0 truncate">{detail(operation)}</span>
					{#if isActive(operation)}
						<div class="flex shrink-0 items-center gap-1">
							{#if operation.status === 'InProgress'}
								<button class="icon-button" type="button" aria-label="Pause" onclick={() => api.pauseOperation(operation.id)}>
									<Icon name="pause" size={14} />
								</button>
							{:else}
								<button class="icon-button" type="button" aria-label="Resume" onclick={() => api.resumeOperation(operation.id)}>
									<Icon name="play" size={14} />
								</button>
							{/if}
							<button class="icon-button" type="button" aria-label="Cancel" onclick={() => api.cancelOperation(operation.id)}>
								<Icon name="x" size={14} />
							</button>
						</div>
					{/if}
				</div>
			</section>
		{/each}
	</div>
{/if}
