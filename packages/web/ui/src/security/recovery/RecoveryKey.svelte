<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import PencilLine from '@lucide/svelte/icons/pencil-line';
	import Printer from '@lucide/svelte/icons/printer';
	import Save from '@lucide/svelte/icons/save';
	import { t } from '@luft/i18n';
	import Dialog from '../../dialogs/Dialog.svelte';
	import { errorText } from '../../text/errors';
	import RecoveryWords from './RecoveryWords.svelte';
	import { keyWords } from './words';
	import WriteDownDialog from './WriteDownDialog.svelte';

	interface Props {
		key: string;
		onsave: () => Promise<boolean>;
		onprint: () => Promise<boolean>;
		onkept?: () => void;
		copyable?: boolean;
	}

	let { key, onsave, onprint, onkept, copyable = true }: Props = $props();

	type Outcome = 'saved' | 'printing' | 'written' | 'copied';

	let done = $state<Outcome | null>(null);
	let writing = $state(false);
	let failure = $state<{ title: string; reason: string } | null>(null);

	const words = $derived(keyWords(key));

	function keep(outcome: Outcome) {
		done = outcome;
		if (outcome !== 'copied') onkept?.();
	}

	async function attempt(action: () => Promise<boolean>, outcome: Outcome, title: string) {
		try {
			if (await action()) keep(outcome);
		} catch (reason) {
			failure = { title, reason: errorText(reason) };
		}
	}

	const save = () => attempt(onsave, 'saved', 'ui-recovery-key-save-failed');
	const print = () => attempt(onprint, 'printing', 'ui-recovery-key-print-failed');
	const copy = () => attempt(() => navigator.clipboard.writeText(key).then(() => true), 'copied', 'ui-recovery-key-copy-failed');

	const NOTES = { saved: 'ui-recovery-key-saved', printing: 'ui-recovery-key-printing', written: 'ui-recovery-key-checked', copied: 'ui-recovery-key-copied' };
</script>

<div class="flex flex-col gap-3">
	<RecoveryWords {key} label={t('ui-recovery-key-label', { key })} />
	<div class="flex flex-wrap items-center gap-1">
		<button type="button" class="plain-button" onclick={save}><Save size={16} />{t('ui-recovery-key-save')}</button>
		<button type="button" class="plain-button" onclick={print}><Printer size={16} />{t('ui-recovery-key-print')}</button>
		{#if onkept && words}
			<button type="button" class="plain-button" onclick={() => (writing = true)}><PencilLine size={16} />{t('ui-recovery-key-write')}</button>
		{/if}
		{#if copyable}
			<button type="button" class="plain-button" onclick={copy}><Copy size={16} />{t('ui-recovery-key-copy')}</button>
		{/if}
		{#if done}
			<span class="ml-auto pr-2 text-[12.5px] text-[var(--text-muted)]">{t(NOTES[done])}</span>
		{/if}
	</div>
</div>

{#if writing && words}
	<WriteDownDialog {words} onchecked={() => keep('written')} onclose={() => (writing = false)} />
{/if}

{#if failure}
	<Dialog title={t(failure.title)} description={failure.reason} onclose={() => (failure = null)}>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (failure = null)}>{t('ui-dialog-close')}</button>
		{/snippet}
	</Dialog>
{/if}
