<script lang="ts">
	import { t } from '@luft/i18n';
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
		<MenuItem onclick={() => run(() => (tasks.details = main))}>{t('barometer-menu-details')}</MenuItem>
	{/if}
	{#if process}
		<MenuItem onclick={() => run(() => navigator.clipboard.writeText(process.command || process.name))}>{t('barometer-menu-copy-command')}</MenuItem>
		<MenuItem onclick={() => run(() => (tasks.priority = { target, nice: process.nice }))}>{t('barometer-menu-priority')}</MenuItem>
	{:else if entry}
		<MenuItem onclick={() => run(() => tasks.askPriority(entry))}>{t('barometer-menu-priority')}</MenuItem>
	{/if}
	<MenuSeparator />
	{#if stopped}
		<MenuItem onclick={() => run(() => tasks.signal(target, 'continue'))}>{t('barometer-menu-resume')}</MenuItem>
	{:else}
		<MenuItem onclick={() => run(() => tasks.signal(target, 'stop'))}>{t('barometer-menu-pause')}</MenuItem>
	{/if}
	<MenuItem onclick={() => run(() => tasks.end(target))}>{t('barometer-menu-end')}</MenuItem>
	<MenuItem danger onclick={() => run(() => tasks.kill(target))}>{t('barometer-force-quit')}</MenuItem>
</ContextMenu>
