<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';

	interface Props {
		count: number;
		onconfirm: () => void;
		onclose: () => void;
	}

	let { count, onconfirm, onclose }: Props = $props();

	let title = $derived(t('rover-delete-forever-title', { count }));

	function confirm() {
		onconfirm();
		onclose();
	}
</script>

<Dialog {title} description={t('rover-delete-forever-description')} {onclose}>
	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>{t('rover-cancel')}</button>
		<button class="button danger" type="button" onclick={confirm}>{t('rover-delete-forever-confirm')}</button>

	{/snippet}
</Dialog>
