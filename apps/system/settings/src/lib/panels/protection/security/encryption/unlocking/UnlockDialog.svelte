<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, PasswordField } from '@luft/ui';
	import { unlockPrompt } from './unlock.svelte';

	let { rejected }: { rejected: string | null } = $props();

	let unlock = $state('');

	const answer = (value: string | null) => unlockPrompt.request?.answer(value);
	const submit = () => unlock && answer(unlock);
</script>

<Dialog
	title={t('settings-encryption-unlock-disk-title')}
	description={t('settings-encryption-unlock-disk-description')}
	onclose={() => answer(null)}
>
	<PasswordField
		label={t('settings-encryption-unlock-disk-field')}
		bind:value={unlock}
		error={rejected ?? ''}
		live
		onkeydown={(event) => event.key === 'Enter' && submit()}
	/>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => answer(null)}>{t('settings-protection-cancel')}</button>
		<button type="button" class="button primary" disabled={!unlock} onclick={submit}>{t('settings-protection-continue')}</button>
	{/snippet}
</Dialog>
