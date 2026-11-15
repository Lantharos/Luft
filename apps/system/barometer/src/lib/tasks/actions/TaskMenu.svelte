<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { Entry } from '#lib/bindings.js';
	import type { Process } from '#lib/bridge/rows.js';
	import { tasks, type Target } from './actions.svelte';

	interface Props {
		at: { x: number; y: number };
		target: Target;
		process?: Process;
		entry?: Entry;
		stopped: boolean;
		onclose: () => void;
	}

	let { at, target, process, entry, stopped, onclose }: Props = $props();

	let main = $derived(process?.pid ?? entry?.main ?? null);

	function run(action: () => unknown) {
		void action();
		onclose();
	}
</script>

<svelte:window onpointerdown={onclose} />

<ContextMenu {at} {onclose}>
	{#if main !== null}
		<MenuItem onclick={() => run(() => (tasks.details = main))}>Details</MenuItem>
	{/if}
	{#if process}
		<MenuItem onclick={() => run(() => navigator.clipboard.writeText(process.command || process.name))}>Copy command</MenuItem>
		<MenuItem onclick={() => run(() => (tasks.priority = { target, nice: process.nice }))}>Change priority…</MenuItem>
	{:else if entry}
		<MenuItem onclick={() => run(() => tasks.askPriority(entry))}>Change priority…</MenuItem>
	{/if}
	<MenuSeparator />
	{#if stopped}
		<MenuItem onclick={() => run(() => tasks.signal(target, 'continue'))}>Resume</MenuItem>
	{:else}
		<MenuItem onclick={() => run(() => tasks.signal(target, 'stop'))}>Pause</MenuItem>
	{/if}
	<MenuItem onclick={() => run(() => tasks.end(target))}>End</MenuItem>
	<MenuItem danger onclick={() => run(() => tasks.kill(target))}>Force quit</MenuItem>
</ContextMenu>
