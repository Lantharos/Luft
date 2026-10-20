<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Printer from '@lucide/svelte/icons/printer';
	import Save from '@lucide/svelte/icons/save';
	import { t } from '@luft/i18n';

	interface Props {
		key: string;
		onsave: () => Promise<boolean>;
		onprint: () => Promise<boolean>;
		copyable?: boolean;
	}

	let { key, onsave, onprint, copyable = true }: Props = $props();

	let done = $state<'saved' | 'printing' | 'copied' | null>(null);
	let error = $state('');

	const groups = $derived(key.split('-'));

	async function attempt(action: () => Promise<boolean>, outcome: NonNullable<typeof done>) {
		error = '';
		try {
			if (!(await action())) return;
			done = outcome;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : String(reason);
		}
	}

	const save = () => attempt(onsave, 'saved');
	const print = () => attempt(onprint, 'printing');
	const copy = () => attempt(() => navigator.clipboard.writeText(key).then(() => true), 'copied');

	const NOTES = { saved: 'ui-recovery-key-saved', printing: 'ui-recovery-key-printing', copied: 'ui-recovery-key-copied' };
</script>

<div class="flex flex-col gap-3">
	<div class="key" aria-label={t('ui-recovery-key-label', { key })}>
		{#each groups as group, index (index)}
			<span>{group}</span>
		{/each}
	</div>
	<div class="flex flex-wrap items-center gap-1">
		<button type="button" class="plain-button" onclick={save}><Save size={16} />{t('ui-recovery-key-save')}</button>
		<button type="button" class="plain-button" onclick={print}><Printer size={16} />{t('ui-recovery-key-print')}</button>
		{#if copyable}
			<button type="button" class="plain-button" onclick={copy}><Copy size={16} />{t('ui-recovery-key-copy')}</button>
		{/if}
		{#if done}
			<span class="ml-auto pr-2 text-[12.5px] text-[var(--text-muted)]">{t(NOTES[done])}</span>
		{/if}
	</div>
	{#if error}
		<p class="px-1 text-[12.5px] text-[var(--danger)]">{error}</p>
	{/if}
</div>

<style>
	.key {
		display: grid;
		grid-template-columns: repeat(4, auto);
		justify-content: center;
		gap: 10px 18px;
		padding: 18px 12px;
		border-radius: 16px;
		background: var(--surface);
		font-family: var(--font-mono);
		font-size: 17px;
		letter-spacing: 0.04em;
		color: var(--text);
		user-select: all;
	}
</style>
