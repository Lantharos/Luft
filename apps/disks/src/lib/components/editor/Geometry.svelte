<script lang="ts">
	import { bytes } from '@luft/ui';
	import { place } from '#lib/editor/edits.js';
	import { neighbours, type Limits } from '#lib/editor/limits.js';
	import { end, type Layout, type Part } from '#lib/editor/model.js';
	import { mebibytes } from '#lib/editor/units.js';
	import SizeInput from './SizeInput.svelte';

	interface Props {
		layout: Layout;
		part: Part;
		limits: Limits;
	}

	let { layout, part, limits }: Props = $props();

	let around = $derived(neighbours(layout, part));
	let before = $derived(part.offset - around.before);
	let after = $derived(around.after - end(part));
	let largest = $derived(Math.min(limits.largest, limits.after - part.offset));
	let range = $derived(
		limits.smallest === limits.largest ? `It stays ${bytes(part.size)}` : `It can be ${bytes(limits.smallest)} to ${bytes(limits.largest)}`
	);
</script>

<div class="flex flex-col gap-2">
	<div class="flex gap-3">
		<SizeInput
			label="Free space before"
			value={before}
			min={limits.movable ? limits.before - around.before : before}
			max={limits.movable ? limits.after - part.size - around.before : before}
			oncommit={(next) => place(part, around.before + next, part.size)}
		/>
		<SizeInput label="Size" value={part.size} min={limits.smallest} max={largest} oncommit={(next) => place(part, part.offset, next)} />
		<SizeInput
			label="Free space after"
			value={after}
			min={around.after - part.offset - largest}
			max={around.after - part.offset - limits.smallest}
			oncommit={(next) => place(part, part.offset, around.after - part.offset - next)}
		/>
	</div>
	<p class="px-1 text-[12.5px] text-[var(--text-muted)] tabular-nums">
		From {mebibytes(part.offset)} MiB to {mebibytes(end(part))} MiB on the drive. {range}.
	</p>
</div>
