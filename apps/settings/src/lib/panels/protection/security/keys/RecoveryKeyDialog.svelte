<script lang="ts">
	import { t } from '@luft/i18n';
	import { Checkbox, Dialog, RecoveryKey } from '@luft/ui';
	import { printRecoveryKey, saveRecoveryKey } from '../api';

	interface Props {
		key: string;
		fresh?: boolean;
		description?: string;
		onclose: () => void;
	}

	let { key, fresh = false, description, onclose }: Props = $props();

	let saved = $state(false);

	const close = () => (!fresh || saved) && onclose();
</script>

<Dialog
	title={fresh ? t('settings-recovery-fresh-title') : t('settings-recovery-shown-title')}
	description={description ?? (fresh ? t('settings-recovery-fresh-description') : t('settings-recovery-shown-description'))}
	wide
	onclose={close}
>
	<RecoveryKey {key} onsave={() => saveRecoveryKey(key)} onprint={() => printRecoveryKey(key)} />
	{#if fresh}
		<Checkbox label={t('settings-recovery-saved')} checked={saved} onchange={(checked) => (saved = checked)}>{t('settings-recovery-saved')}</Checkbox>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary" disabled={fresh && !saved} onclick={onclose}>{t('settings-protection-done')}</button>
	{/snippet}
</Dialog>
