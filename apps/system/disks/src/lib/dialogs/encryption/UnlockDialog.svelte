<script lang="ts">
	import { t } from '@luft/i18n';
	import { tick } from 'svelte';
	import { Checkbox, Dialog, errorText, PasswordField, Spinner } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { volumeName } from '#lib/format.js';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let passphrase = $state('');
	let remember = $state(false);
	let error = $state('');
	let working = $state(false);
	let field = $state<{ focus: () => void }>();

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	async function submit() {
		if (!passphrase || working) return;
		working = true;
		error = '';
		try {
			const outcome = await commands.disksUnlock({ block: volume.block, passphrase, remember }, WAIT);
			if ('wrongKey' in outcome) error = t('disks-unlock-wrong');
			else onclose();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) error = message;
		} finally {
			working = false;
		}
	}
</script>

<Dialog title={t('disks-unlock-title', { name: volumeName(volume) })} {onclose}>
	<PasswordField bind:this={field} label={t('disks-passphrase')} bind:value={passphrase} {error} live autocomplete="current-password" onkeydown={(event) => event.key === 'Enter' && submit()} />
	<Checkbox label={t('disks-remember')} checked={remember} onchange={(value) => (remember = value)}>{t('disks-remember')}</Checkbox>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
		<button type="button" class="button primary" disabled={!passphrase || working} onclick={submit}>{#if working}<Spinner />{t('disks-unlock-working')}{:else}{t('disks-action-unlock')}{/if}</button>
	{/snippet}
</Dialog>
