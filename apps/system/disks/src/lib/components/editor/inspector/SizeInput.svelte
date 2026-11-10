<script lang="ts">
	import { onMount } from 'svelte';
	import { bytes, TextField, tooltip } from '@luft/ui';
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

	let field = $state<TextField>();
	let text = $state('');
	let fixed = $derived(min >= max);
	let shown = $derived(exact ? mebibytes(value) : bytes(value));
	let range = $derived(fixed ? `Stays ${bytes(value)}` : `${bytes(min)} to ${bytes(max)}`);

	$effect.pre(() => {
		text = shown;
	});

	onMount(() => {
		if (focused) field?.focus();
	});

	function commit() {
		if (text === shown) return;
		const parsed = parseSize(text, exact ? undefined : unitOf(shown));
		text = shown;
		if (parsed !== null) oncommit(Math.min(max, Math.max(min, parsed)));
	}

	function selectAll(event: FocusEvent) {
		if (event.target instanceof HTMLInputElement) event.target.select();
	}
</script>

{#snippet unit()}
	<span class="px-3 text-[13px] leading-7 text-[var(--text-muted)]">MiB</span>
{/snippet}

<div class="min-w-0 flex-1" {@attach tooltip(range)} onfocusin={selectAll} onfocusout={commit}>
	<TextField
		bind:this={field}
		label={exact ? `${label} in MiB` : label}
		inputmode="decimal"
		disabled={fixed}
		bind:value={text}
		trailing={exact ? unit : undefined}
		onkeydown={(event) => {
			if (event.key === 'Enter') commit();
			if (event.key === 'Escape') text = shown;
		}}
	/>
</div>
