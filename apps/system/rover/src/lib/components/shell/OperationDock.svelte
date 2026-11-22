<script lang="ts">
	import Archive from '@luft/symbols/icons/archive';
	import Check from '@luft/symbols/icons/check';
	import Copy from '@luft/symbols/icons/copy';
	import Pause from '@luft/symbols/icons/pause';
	import Play from '@luft/symbols/icons/play';
	import Trash2 from '@luft/symbols/icons/trash-2';
	import Upload from '@luft/symbols/icons/upload';
	import Usb from '@luft/symbols/icons/usb';
	import X from '@luft/symbols/icons/x';
	import { t } from '@luft/i18n';
	import { basename, bytes, duration } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { exploreSpace } from '#lib/bridge/index.js';
	import type { Operation } from '#lib/bindings.js';

	interface Props {
		operations: Operation[];
		onerror: (error: unknown) => void;
	}

	let { operations, onerror }: Props = $props();

	const ATTENTION_DELAY_MS = 650;
	const COMPLETED_LINGER_MS = 2500;
	const SAFE_TO_EJECT_LINGER_MS = 8000;
	const FULL_LINGER_MS = 20_000;
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
		if (operation.completedAt === null) return false;
		const linger = operation.full ? FULL_LINGER_MS : operation.phase === 'SafeToEject' ? SAFE_TO_EJECT_LINGER_MS : COMPLETED_LINGER_MS;
		return now - operation.completedAt >= linger;
	}

	function shouldShow(operation: Operation) {
		if (lingerEnded(operation)) return false;
		if (operation.status === 'Failed' || operation.status === 'Cancelled') return true;
		return (operation.completedAt ?? now) - operation.startedAt >= ATTENTION_DELAY_MS;
	}

	function title(operation: Operation) {
		const kind = operation.opType.toLowerCase();
		const destination = operation.destinationLabel;
		if (operation.status === 'Completed') {
			if (operation.phase === 'SafeToEject') return t('rover-operation-safe-to-eject');
			return t('rover-operation-done', { operation: kind });
		}
		if (operation.phase === 'Finalizing') return destination ? t('rover-operation-finalizing-to', { destination }) : t('rover-operation-finalizing');
		if (operation.phase === 'Preparing') return t('rover-operation-preparing');
		if (destination && (operation.opType === 'Copy' || operation.opType === 'Move')) return t('rover-operation-running-to', { operation: kind, destination });
		return t('rover-operation-running', { operation: kind });
	}

	function icon(operation: Operation) {
		if (operation.phase === 'SafeToEject') return Check;
		if (operation.opType === 'Compress' || operation.opType === 'Extract') return Archive;
		if (operation.phase === 'Finalizing' && operation.destinationIsRemovable) return Usb;
		if (operation.opType === 'Delete' || operation.opType === 'Trash') return Trash2;
		return operation.opType === 'Move' ? Upload : Copy;
	}

	function subject(operation: Operation) {
		if (!isActive(operation)) return operation.status === 'Failed' ? t('rover-operation-failed') : t('rover-operation-finished-short');
		if (operation.phase === 'Finalizing') return operation.destinationIsRemovable ? t('rover-operation-do-not-unplug') : t('rover-operation-finishing-writes');
		return operation.currentFile ? basename(operation.currentFile) : t('rover-operation-preparing');
	}

	function speed(operation: Operation) {
		if (operation.status !== 'InProgress' || operation.phase === 'Finalizing' || operation.bytesProcessed <= 0) return 0;
		return operation.bytesProcessed / Math.max(0.75, (now - operation.startedAt) / 1000);
	}

	function detail(operation: Operation) {
		if (operation.status === 'Completed') {
			if (operation.phase === 'SafeToEject') return operation.opType === 'Move' ? t('rover-operation-moved-safely') : t('rover-operation-copied-safely');
			return t('rover-operation-finished', { count: operation.totalItems });
		}
		if (operation.status === 'Failed') return operation.error ?? t('rover-operation-failed');
		if (operation.status === 'Cancelled') return t('rover-operation-cancelled');
		if (operation.phase === 'Finalizing') {
			return operation.destinationIsRemovable ? t('rover-operation-finalizing-unplug') : t('rover-operation-finalizing');
		}
		if (operation.totalBytes === 0) return t('rover-operation-items', { done: operation.itemsProcessed, count: operation.totalItems });
		const rate = speed(operation);
		const remaining = operation.totalBytes - operation.bytesProcessed;
		const progress = { done: bytes(operation.bytesProcessed), total: bytes(operation.totalBytes) };
		if (rate <= 0) return t('rover-operation-bytes', progress);
		if (remaining <= 0) return t('rover-operation-bytes-rate', { ...progress, rate: bytes(rate) });
		return t('rover-operation-bytes-left', { ...progress, rate: bytes(rate), left: duration(remaining / rate) });
	}
</script>

{#if visible.length > 0}
	<div class="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[360px] max-w-[calc(100%-32px)] flex-col gap-2">
		{#each visible as operation (operation.id)}
			{@const Icon = icon(operation)}
			<section
				class="pointer-events-auto rounded-[18px] bg-[color-mix(in_oklab,var(--popover)_86%,transparent)] p-3 text-[13px] shadow-[0_20px_60px_var(--shadow-soft),inset_0_1px_0_var(--hairline)] backdrop-blur-2xl"
				aria-label={t('rover-operation-label', { title: title(operation) })}
			>
				<div class="flex items-center gap-3">
					<div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] text-[var(--text-soft)]">
						<Icon size={17} />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between gap-3 text-[var(--text)]">
							<span class="truncate">{title(operation)}</span>
							<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{t('rover-operation-percent', { percent: Math.round(operation.progress * 100) })}</span>
						</div>
						<div class="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">{subject(operation)}</div>
					</div>
				</div>
				<div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_8%,transparent)]">
					<div
						class="h-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-200"
						style:transform="scaleX({Math.max(0.02, operation.progress)})"
					></div>
				</div>
				<div class="mt-2 flex items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
					<span class="min-w-0 truncate">{detail(operation)}</span>
					{#if operation.full}
						{@const folder = operation.full}
						<button class="button shrink-0" type="button" onclick={() => exploreSpace(folder).catch(onerror)}>{t('rover-free-up-space')}</button>
					{:else if isActive(operation)}
						<div class="flex shrink-0 items-center gap-1">
							{#if operation.status === 'InProgress'}
								<button class="icon-button" type="button" aria-label={t('rover-operation-pause')} onclick={() => commands.pauseOperation({ id: operation.id })}>
									<Pause size={14} />
								</button>
							{:else}
								<button class="icon-button" type="button" aria-label={t('rover-operation-resume')} onclick={() => commands.resumeOperation({ id: operation.id })}>
									<Play size={14} />
								</button>
							{/if}
							<button class="icon-button" type="button" aria-label={t('rover-cancel')} onclick
={() => commands.cancelOperation({ id: operation.id })}>
								<X size={14} />
							</button>
						</div>
					{/if}
				</div>
			</section>
		{/each}
	</div>
{/if}
