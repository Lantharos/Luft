<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';

	interface Props {
		onconfirm: () => void;
		onclose: () => void;
	}

	let { onconfirm, onclose }: Props = $props();

	function confirm() {
		onconfirm();
		onclose();
	}
</script>

<Dialog title={t('rover-empty-trash-title')} description={t('rover-empty-trash-description')} {onclose}>
	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>{t('rover-cancel')}</button>
		<button class="button danger" type="button" onclick={confirm}>{t('rover-empty-trash')}</button>

	{/snippet}
</Dialog>
