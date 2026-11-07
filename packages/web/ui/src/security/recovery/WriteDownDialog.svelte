<script lang="ts">
	import { t } from '@luft/i18n';
	import Dialog from '../../dialogs/Dialog.svelte';
	import RecoveryWords from './RecoveryWords.svelte';
	import WordField from './WordField.svelte';
	import { completeWord, pickWords } from './words';

	interface Props {
		words: string[];
		onchecked: () => void;
		onclose: () => void;
	}

	let { words, onchecked, onclose }: Props = $props();

	const asked = pickWords(3);

	let checking = $state(false);
	let typed = $state(asked.map(() => ''));
	let fields = $state<WordField[]>([]);

	const right = $derived(asked.map((position, index) => completeWord(typed[index]) === words[position]));
	const checked = $derived(right.every(Boolean));

	$effect(() => {
		if (checking) fields[0]?.focus();
	});

	function wrong(index: number) {
		const word = completeWord(typed[index]);
		return word !== null && word.length === typed[index].length && !right[index];
	}

	function done() {
		onchecked();
		onclose();
	}
</script>

<Dialog
	title={t(checking ? 'ui-recovery-key-check-title' : 'ui-recovery-key-write-title')}
	description={checking ? t('ui-recovery-key-check', { first: asked[0] + 1, second: asked[1] + 1, third: asked[2] + 1 }) : t('ui-recovery-key-write-description')}
	wide
	{onclose}
>
	{#if checking}
		<div class="grid grid-cols-3 gap-3">
			{#each asked as position, index (position)}
				<WordField
					bind:this={fields[index]}
					bind:value={typed[index]}
					label={t('ui-recovery-key-word', { number: position + 1 })}
					error={wrong(index) ? t('ui-recovery-key-word-wrong', { number: position + 1 }) : ''}
					onnext={index < asked.length - 1 ? () => fields[index + 1]?.focus() : checked ? done : undefined}
				/>
			{/each}
		</div>
	{:else}
		<RecoveryWords key={words.join(' ')} label={t('ui-recovery-key-label', { key: words.join(' ') })} />
	{/if}
	{#snippet actions()}
		{#if checking}
			<button type="button" class="button" onclick={() => (checking = false)}>{t('ui-dialog-back')}</button>
			<button type="button" class="button primary" disabled={!checked} onclick={done}>{t('ui-dialog-done')}</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>{t('ui-dialog-cancel')}</button>
			<button type="button" class="button primary" onclick={() => (checking = true)}>{t('ui-recovery-key-written')}</button>
		{/if}
	{/snippet}
</Dialog>
