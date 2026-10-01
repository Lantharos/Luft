<script lang="ts">
	import { Dialog, VirtualScroller } from '@luft/ui';
	import { bytes } from '$lib/format';
	import type { Update } from './api';
	import { areas } from './summary';

	let { updates, onclose }: { updates: Update[]; onclose: () => void } = $props();

	type Line = { kind: 'area'; key: string; title: string; count: number } | { kind: 'update'; key: string; update: Update };

	const lines = $derived(
		areas(updates).flatMap((area): Line[] => [
			{ kind: 'area', key: `area:${area.title}`, title: area.title, count: area.updates.length },
			...area.updates.map((update): Line => ({ kind: 'update', key: update.package.id, update }))
		])
	);

	const version = (update: Update) => update.package.version.replace(/\.fc\d+$/, '');
</script>

<Dialog title="What's included" description="{updates.length} updates for the system, its drivers and its libraries" wide {onclose}>
	<VirtualScroller class="soft-scroll -mx-2 h-[420px]" items={lines} key={(line) => line.key} layout={{ itemHeight: 44 }}>
		{#snippet children(line)}
			{#if line.kind === 'area'}
				<div class="flex h-full items-end justify-between px-2 pb-1.5 text-[13px] font-semibold text-[var(--text-soft)]">
					<span>{line.title}</span>
					<span class="font-normal text-[var(--text-muted)]">{line.count}</span>
				</div>
			{:else}
				{@const update = line.update}
				<div class="flex h-full items-center gap-3 px-2">
					<div class="flex min-w-0 flex-1 flex-col">
						<span class="truncate text-[13.5px]">{update.package.name}</span>
						<span class="truncate text-[12px] text-[var(--text-muted)]">
							{update.installedVersion ? `${update.installedVersion.replace(/\.fc\d+$/, '')} → ` : ''}{version(update)}{update.security ? ' · Security fix' : ''}
						</span>
					</div>
					{#if update.downloadSize}
						<span class="text-[12.5px] text-[var(--text-muted)] tabular-nums">{bytes(update.downloadSize)}</span>
					{/if}
				</div>
			{/if}
		{/snippet}
	</VirtualScroller>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
