<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';

	let { refresh, onclose }: { refresh: () => Promise<void>; onclose: () => void } = $props();

	let key = $state('');
	let busy = $state(false);
	let error = $state('');

	let ready = $derived(key.trim().length > 0 && !busy);

	async function attempt(action: () => Promise<void>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}

	const choose = () =>
		attempt(async () => {
			const chosen = await commands.remoteLoginChooseKey();
			if (chosen) key = chosen;
		});

	function add() {
		if (!ready) return;
		void attempt(async () => {
			await commands.remoteLoginAddKey({ key });
			await refresh();
			onclose();
		});
	}
</script>

<Dialog title={t('settings-remote-login-key-add-title')} description={t('settings-remote-login-key-add-description')} wide onclose={() => !busy && onclose()}>
	<TextField
		bind:value={key}
		label={t('settings-remote-login-key')}
		showLabel
		placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5… you@laptop"
		disabled={busy}
		invalid={Boolean(error)}
		onkeydown={(event) => event.key === 'Enter' && add()}
	/>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button mr-auto" disabled={busy} onclick={choose}>{t('settings-remote-login-key-choose')}</button>
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('settings-protection-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={add}>{t('settings-remote-login-key-add-button')}</button>
	{/snippet}
</Dialog>
