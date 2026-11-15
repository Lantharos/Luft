<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { editor } from '#lib/editor/editor.svelte.js';

	interface Props {
		name: string;
		onclose: () => void;
	}

	let { name, onclose }: Props = $props();

	let described = $derived(editor.described);
	let losses = $derived(described.flatMap((step) => (step.loss ? [step.loss] : [])));
	let unmounts = $derived(described.some((step) => step.unmounts));

	function apply() {
		onclose();
		void editor.apply();
	}
</script>

<Dialog title={t('disks-apply-title', { count: described.length, name })} wide {onclose}>
	<ol class="flex list-decimal flex-col gap-1.5 pl-5 text-[13.5px]">
		{#each described as step, index (index)}
			<li>{step.sentence}</li>
		{/each}
	</ol>
	{#if losses.length}
		<div class="flex flex-col gap-1.5 text-[13px] text-[var(--danger)]">
			{#each losses as loss (loss)}
				<p>{loss}</p>
			{/each}
		</div>
	{/if}
	<p class="text-[13px] text-[var(--text-muted)]">{unmounts ? t('disks-apply-final-unmounts') : t('disks-apply-final')}</p>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
		<button type="button" class={['button', losses.length ? 'danger' : 'primary']} onclick={apply}>{t('disks-editor-apply')}</button>
	{/snippet}
</Dialog>
