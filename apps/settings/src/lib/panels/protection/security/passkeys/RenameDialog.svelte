<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, TextField } from '@luft/ui';
	import { accountLabel, renamePasskey, siteLabel, type Passkey } from './api';

	let { passkey, onclose }: { passkey: Passkey; onclose: () => void } = $props();

	let name = $state(untrack(() => passkey.nickname));
	let busy = $state(false);
	let error = $state('');

	async function save() {
		busy = true;
		error = '';
		try {
			await renamePasskey(passkey.id, name);
			onclose();
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog title={t('settings-passkeys-rename-title')} description={t('settings-passkeys-rename-description', { site: siteLabel(passkey) })} {onclose}>
	<TextField
		label={t('settings-passkeys-name')}
		bind:value={name}
		placeholder={passkey.displayName || passkey.account || accountLabel(passkey)}
		{error}
		live
		disabled={busy}
		onkeydown={(event) => event.key === 'Enter' && save()}
	/>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-protection-cancel')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={save}>{t('settings-passkeys-save')}</button>
	{/snippet}
</Dialog>
