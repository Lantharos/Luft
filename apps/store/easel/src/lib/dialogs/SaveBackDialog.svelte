<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';

	interface Props {
		name: string;
		replaceable: boolean;
		onchoose: (choice: 'replace' | 'copy' | 'cancel') => void;
	}

	let { name, replaceable, onchoose }: Props = $props();
</script>

<Dialog title={t('easel-save-back-title', { name })} description={t(replaceable ? 'easel-save-back-body' : 'easel-save-back-copy-only')} onclose={() => onchoose('cancel')}>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={() => onchoose('cancel')}>{t('easel-cancel')}</button>
		<button type="button" class={['button', !replaceable && 'primary']} onclick={() => onchoose('copy')}>{t('easel-save-copy')}</button>
		{#if replaceable}
			<button type="button" class="button primary" onclick={() => onchoose('replace')}>{t('easel-save-replace')}</button>
		{/if}
	{/snippet}
</Dialog>
