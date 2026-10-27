<script lang="ts">
	import { bytes } from '@luft/ui';
	import type { OtherSystem } from '#lib/bindings.js';
	import { orderedParts, partName, startupName } from '#lib/systems.js';

	interface Props {
		system: OtherSystem;
	}

	let { system }: Props = $props();

	let lines = $derived([
		...[...orderedParts(system)].reverse().map((part) => ({ key: part.block, name: partName(system, part), size: bytes(part.size) })),
		...(system.kept === null ? [] : [{ key: 'kept', name: `${system.name}’s files`, size: bytes(system.kept) }]),
		...(system.startups.length ? [{ key: 'startup', name: startupName(system), size: '' }] : [])
	]);
</script>

<ul class="row-group">
	{#each lines as line (line.key)}
		<li class="line">
			<span class="min-w-0 flex-1 truncate">{line.name}</span>
			<span class="text-[13px] text-[var(--text-muted)] tabular-nums">{line.size}</span>
		</li>
	{/each}
</ul>

<style>
	.line {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		font-size: 13.5px;
	}
</style>
