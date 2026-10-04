<script lang="ts">
	import { bytes, tooltip } from '@luft/ui';
	import { mebibytes, parseSize, unitOf } from '#lib/editor/units.js';

	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		exact?: boolean;
		focused?: boolean;
		oncommit: (value: number) => void;
	}

	let { label, value, min, max, exact = false, focused = false, oncommit }: Props = $props();

	let typed = $state<string | null>(null);
	let fixed = $derived(min >= max);
	let shown = $derived(exact ? mebibytes(value) : bytes(value));
	let range = $derived(fixed ? `Stays ${bytes(value)}` : `${bytes(min)} to ${bytes(max)}`);

	function focusOnMount(input: HTMLInputElement) {
		if (focused) input.focus();
	}

	function commit() {
		if (typed === null) return;
		const parsed = parseSize(typed, exact ? undefined : unitOf(shown));
		typed = null;
		if (parsed !== null) oncommit(Math.min(max, Math.max(min, parsed)));
	}
</script>

<label class="field" class:locked={fixed} {@attach tooltip(range)}>
	<input
		inputmode="decimal"
		aria-label={exact ? `${label} in MiB` : label}
		disabled={fixed}
		value={typed ?? shown}
		{@attach focusOnMount}
		onfocus={(event) => event.currentTarget.select()}
		oninput={(event) => (typed = event.currentTarget.value)}
		onblur={commit}
		onkeydown={(event) => {
			if (event.key === 'Enter') commit();
			if (event.key === 'Escape') typed = null;
		}}
	/>
	{#if exact}
		<span class="unit">MiB</span>
	{/if}
</label>

<style>
	.field {
		display: flex;
		height: 36px;
		min-width: 0;
		flex: 1;
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

	input {
		min-width: 0;
		flex: 1;
		background: transparent;
		font-variant-numeric: tabular-nums;
		outline: none;
	}

	.unit {
		color: var(--text-muted);
	}
</style>
