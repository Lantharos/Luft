<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Spinner } from '@luft/ui';
	import { untrack } from 'svelte';
	import { commands } from '#lib/bindings.js';

	interface Props {
		name: string;
		devices: [string, string][];
		onclose: () => void;
	}

	let { name, devices, onclose }: Props = $props();

	const known = new Set(untrack(() => devices.map(([id]) => id)));
	let pin = $state('');
	let problem = $state('');

	$effect(() => {
		commands.postStartPairing().then(
			(started) => (pin = started),
			(reason) => (problem = errorText(reason))
		);
		return () => void commands.postStopPairing().catch(() => {});
	});

	$effect(() => {
		if (devices.some(([id]) => !known.has(id))) onclose();
	});
</script>

<Dialog title={t('settings-post-pair')} description={t('settings-post-pair.description', { name })} {onclose}>
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{:else if pin}
		<p class="pin">{pin}</p>
		<p class="flex items-center justify-center gap-2 text-[13px] text-[var(--text-soft)]"><Spinner size={14} />{t('settings-post-pair-waiting')}</p>
	{:else}
		<div class="flex justify-center py-6"><Spinner size={20} /></div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-post-cancel')}</button>
	{/snippet}
</Dialog>

<style>
	.pin {
		padding: 10px 0 6px;
		font-family: var(--font-mono);
		font-size: 34px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.12em;
		text-align: center;
		color: var(--text);
		user-select: text;
	}
</style>
