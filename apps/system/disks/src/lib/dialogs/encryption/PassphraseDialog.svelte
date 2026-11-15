<script lang="ts">
	import { t } from '@luft/i18n';
	import { tick } from 'svelte';
	import { Dialog, errorText, PasswordField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { volumeName } from '#lib/format.js';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let current = $state('');
	let next = $state('');
	let confirm = $state('');
	let error = $state('');
	let working = $state(false);
	let field = $state<{ focus: () => void }>();

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	let mismatch = $derived(confirm.length > 0 && next !== confirm);
	let valid = $derived(current.length > 0 && next.length > 0 && next === confirm);

	async function submit() {
		if (!valid || working) return;
		working = true;
		error = '';
		try {
			const outcome = await commands.disksChangePassphrase({ block: volume.block, current, next }, WAIT);
			if ('wrongKey' in outcome) error = t('disks-passphrase-current-wrong');
			else onclose();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) error = message;
		} finally {
			working = false;
		}
	}
</script>

<Dialog title={t('disks-passphrase-change-title', { name: volumeName(volume) })} {onclose}>
	<PasswordField bind:this={field} label={t('disks-passphrase-current')} bind:value={current} {error} live autocomplete="current-password" />
	<PasswordField label={t('disks-passphrase-new')} bind:value={next} autocomplete="new-password" />
	<PasswordField label={t('disks-passphrase-new-confirm')} bind:value={confirm} error={mismatch ? t('disks-passphrase-mismatch') : ''} live autocomplete="new-password" onkeydown={(event) => event.key === 'Enter' && submit()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
		<button type="button" class="button primary" disabled={!valid || working} onclick={submit}>{t('disks-passphrase-change-action')}</button>
	{/snippet}
</Dialog>
