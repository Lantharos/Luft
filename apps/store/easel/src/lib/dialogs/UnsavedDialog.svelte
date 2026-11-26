<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';

	interface Props {
		name: string;
		onchoose: (choice: 'save' | 'discard' | 'cancel') => void;
	}

	let { name, onchoose }: Props = $props();
</script>

<Dialog title={t('easel-unsaved-title', { name })} description={t('easel-unsaved-body')} onclose={() => onchoose('cancel')}>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={() => onchoose('discard')}>{t('easel-unsaved-discard')}</button>
		<button type="button" class="button" onclick={() => onchoose('cancel')}>{t('easel-cancel')}</button>
		<button type="button" class="button primary" onclick={() => onchoose('save')}>{t('easel-save')}</button>
	{/snippet}
</Dialog>
