<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { account } from '#lib/state/account.svelte.js';
	import { channelName } from './channels.js';

	const notices = $derived(account.notices);
	const [first] = $derived(notices.lost);

	const title = $derived.by(() => {
		if (!first) return t('account-ended');
		if (notices.lost.length > 1) return t('account-lost-several');
		return t('account-lost', { channel: channelName(first.channel), name: first.name });
	});
	const description = $derived(first ? t('account-lost-description') : t('account-ended-description'));

	async function signIn() {
		await account.dismiss();
		account.show();
	}
</script>

<Dialog {title} {description} onclose={() => account.dismiss()}>
	{#snippet actions()}
		{#if first}
			<button type="button" class="button primary" onclick={() => account.dismiss()}>{t('account-ok')}</button>
		{:else}
			<button type="button" class="button" onclick={() => account.dismiss()}>{t('account-not-now')}</button>
			<button type="button" class="button primary" onclick={signIn}>{t('account-sign-in')}</button>
		{/if}
	{/snippet}
</Dialog>
