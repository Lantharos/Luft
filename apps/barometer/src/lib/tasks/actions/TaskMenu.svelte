<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { Process } from '#lib/backend/rows.js';
	import { tasks, type Target } from './actions.svelte';

	interface Props {
		at: { x: number; y: number };
		target: Target;
		process?: Process;
		stopped: boolean;
		onclose: () => void;
	}

	let { at, target, process, stopped, onclose }: Props = $props();

	function run(action: () => unknown) {
		void action();
		onclose();
	}
</script>

<svelte:window onpointerdown={onclose} />

<ContextMenu {at} {onclose}>
	{#if process}
		<MenuItem onclick={() => run(() => (tasks.details = process.pid))}>Details</MenuItem>
		<MenuItem onclick={() => run(() => navigator.clipboard.writeText(process.command || process.name))}>Copy command</MenuItem>
		<MenuItem onclick={() => run(() => (tasks.priority = { pid: process.pid, name: process.name, nice: process.nice }))}>Change priority…</MenuItem>
		<MenuSeparator />
	{/if}
	{#if stopped}
		<MenuItem onclick={() => run(() => tasks.signal(target, 'continue'))}>Resume</MenuItem>
	{:else}
		<MenuItem onclick={() => run(() => tasks.signal(target, 'stop'))}>Pause</MenuItem>
	{/if}
	<MenuItem onclick={() => run(() => tasks.end(target))}>End</MenuItem>
	<MenuItem danger onclick={() => run(() => tasks.kill(target))}>Force quit</MenuItem>
</ContextMenu>
