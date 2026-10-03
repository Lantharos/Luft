<script lang="ts">
	import { bytes } from '@luft/ui';
	import { mebibytes, parseSize } from '#lib/editor/units.js';

	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		oncommit: (value: number) => void;
	}

	let { label, value, min, max, oncommit }: Props = $props();

	let typed = $state<string | null>(null);
	let fixed = $derived(min >= max);

	function commit() {
		if (typed === null) return;
		const parsed = parseSize(typed);
		typed = null;
		if (parsed !== null) oncommit(Math.min(max, Math.max(min, parsed)));
	}
</script>

<div class="size">
	<span class="caption">{label}</span>
	<label class="field" class:locked={fixed}>
		<input
			inputmode="decimal"
			aria-label="{label} in MiB"
			disabled={fixed}
			value={typed ?? mebibytes(value)}
			oninput={(event) => (typed = event.currentTarget.value)}
			onblur={commit}
			onkeydown={(event) => {
				if (event.key === 'Enter') commit();
				if (event.key === 'Escape') typed = null;
			}}
		/>
		<span class="unit">MiB</span>
	</label>
	<span class="caption">{bytes(value)}</span>
</div>

<style>
	.size {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 6px;
	}

	.caption {
		padding-inline: 4px;
		font-size: 12.5px;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	input {
		min-width: 0;
		flex: 1;
		background: transparent;
		text-align: right;
		font-variant-numeric: tabular-nums;
		outline: none;
	}

	.unit {
		color: var(--text-muted);
	}

	.field {
		display: flex;
		height: 36px;
		align-items: center;
		gap: 6px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding-inline: 14px;
		font-size: 13px;
		transition:
			background-color 160ms var(--ease),
			box-shadow 160ms var(--ease);
	}

	.field:hover:not(.locked) {
		background: var(--control-hover);
	}

	.field:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.field.locked {
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--hairline);
		color: var(--text-soft);
	}
</style>
