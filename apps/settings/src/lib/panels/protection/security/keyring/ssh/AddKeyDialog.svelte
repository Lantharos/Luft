<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Switch, TextField } from '@luft/ui';
	import { generateKey } from '../api';

	interface Props {
		chipKeys: boolean;
		refresh: () => Promise<void>;
		onclose: () => void;
	}

	let { chipKeys, refresh, onclose }: Props = $props();

	let name = $state('');
	let chip = $state(untrack(() => chipKeys));
	let busy = $state(false);
	let error = $state('');

	let ready = $derived(name.trim().length > 0 && !busy);

	async function add() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			await generateKey(name.trim(), chip);
			await refresh();
			onclose();
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog title={t('settings-passwords-ssh-add-title')} description={t('settings-passwords-ssh-add-description')} onclose={() => !busy && onclose()}>
	<TextField
		bind:value={name}
		label={t('settings-passwords-ssh-name')}
		showLabel
		placeholder={t('settings-passwords-ssh-name-placeholder')}
		disabled={busy}
		onkeydown={(event) => event.key === 'Enter' && add()}
	/>
	<div class="flex items-center gap-4 px-1">
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="text-[14px] font-medium">{t('settings-passwords-ssh-chip')}</span>
			<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">
				{chipKeys ? t('settings-passwords-ssh-chip-description') : t('settings-passwords-ssh-chip-unsupported')}
			</span>
		</div>
		<Switch label={t('settings-passwords-ssh-chip')} checked={chip} disabled={!chipKeys || busy} onchange={(on) => (chip = on)} />
	</div>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('settings-protection-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={add}>{t('settings-passwords-ssh-add')}</button>
	{/snippet}
</Dialog>
