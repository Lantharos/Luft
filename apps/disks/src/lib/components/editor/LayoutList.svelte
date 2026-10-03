<script lang="ts">
	import { bytes } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { end, gaps, type Layout, type Span } from '#lib/editor/model.js';
	import { mebibytes } from '#lib/editor/units.js';
	import { FILESYSTEM_NAMES } from '#lib/format.js';

	interface Props {
		layout: Layout;
		tones: Map<string, string>;
	}

	let { layout, tones }: Props = $props();

	type Row = { key: string; name: string; kind: string; span: Span; tone: string | null; pending: boolean };

	let rows = $derived(
		[
			...layout.parts.map(
				(part): Row => ({
					key: part.key,
					name: part.title,
					kind: part.locked ? 'Encrypted' : part.filesystem ? (FILESYSTEM_NAMES[part.filesystem] ?? part.filesystem) : 'No file system',
					span: part,
					tone: tones.get(part.key) ?? null,
					pending: part.pending
				})
			),
			...gaps(layout).map((gap): Row => ({ key: `free:${gap.offset}`, name: 'Free space', kind: '', span: gap, tone: null, pending: false }))
		].sort((a, b) => a.span.offset - b.span.offset)
	);
</script>

<div class="row-group" role="listbox" aria-label="Partitions and free space">
	{#each rows as row (row.key)}
		<button
			type="button"
			role="option"
			aria-selected={editor.selected === row.key}
			class={['row', editor.selected === row.key && 'chosen']}
			onclick={() => (editor.selected = row.key)}
		>
			<span class={['dot', !row.tone && 'free', row.pending && 'pending']} style:--tone={row.tone}></span>
			<span class="name">{row.name}</span>
			<span class="muted">{row.kind}</span>
			<span class="numbers">{mebibytes(row.span.offset)}–{mebibytes(end(row.span))} MiB</span>
			<span class="size">{bytes(row.span.size)}</span>
		</button>
	{/each}
</div>

<style>
	.row {
		display: flex;
		min-height: 40px;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		text-align: left;
		font-size: 13px;
		transition: background-color 160ms var(--ease);
	}

	.row:hover,
	.row.chosen {
		background: color-mix(in oklab, var(--ink) 4%, transparent);
	}

	.dot {
		height: 10px;
		width: 10px;
		flex: none;
		border-radius: 50%;
		background: var(--tone);
	}

	.dot.free {
		background: none;
		box-shadow: inset 0 0 0 1.5px var(--text-muted);
	}

	.dot.pending {
		background: none;
		box-shadow: inset 0 0 0 1.5px var(--tone);
	}

	.name {
		min-width: 0;
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.muted {
		flex: none;
		color: var(--text-muted);
	}

	.numbers {
		margin-left: auto;
		flex: none;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.size {
		width: 72px;
		flex: none;
		text-align: right;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}
</style>
