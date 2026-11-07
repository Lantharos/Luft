<script lang="ts">
	import { t } from '@luft/i18n';
	import Dialog from '../../dialogs/Dialog.svelte';
	import RecoveryKey from './RecoveryKey.svelte';

	interface Props {
		key: string;
		title: string;
		description: string;
		fresh?: boolean;
		onsave: () => Promise<boolean>;
		onprint: () => Promise<boolean>;
		onclose: () => void;
	}

	let { key, title, description, fresh = false, onsave, onprint, onclose }: Props = $props();

	let kept = $state(false);

	const close = () => (!fresh || kept) && onclose();
</script>

<Dialog {title} {description} wide onclose={close}>
	<RecoveryKey {key} {onsave} {onprint} onkept={fresh ? () => (kept = true) : undefined} />
	{#snippet actions()}
		<button type="button" class="button primary" disabled={fresh && !kept} onclick={onclose}>{t('ui-dialog-done')}</button>
	{/snippet}
</Dialog>
