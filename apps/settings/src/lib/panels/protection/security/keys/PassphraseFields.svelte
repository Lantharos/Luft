<script lang="ts">
	import { t } from '@luft/i18n';
	import { PasswordField } from '@luft/ui';
	import StrengthMeter from '#lib/panels/system/accounts/users/StrengthMeter.svelte';
	import { MINIMUM_LENGTH, measure } from '#lib/panels/system/accounts/users/strength.js';

	interface Props {
		passphrase: string;
		confirmation: string;
		onsubmit?: () => void;
	}

	let { passphrase = $bindable(), confirmation = $bindable(), onsubmit }: Props = $props();

	let strength = $derived(passphrase ? measure(passphrase, []) : null);
	let mismatch = $derived(confirmation.length >= passphrase.length && confirmation !== passphrase ? t('settings-encryption-passphrases-differ') : '');

	const enter = (event: KeyboardEvent) => event.key === 'Enter' && onsubmit?.();
</script>

<div class="flex flex-col gap-2">
	<PasswordField
		label={t('settings-encryption-passphrase-field')}
		showLabel
		bind:value={passphrase}
		placeholder={t('settings-encryption-passphrase-length', { min: MINIMUM_LENGTH })}
		autocomplete="new-password"
		live
		onkeydown={enter}
	/>
	{#if strength}
		<StrengthMeter {strength} />
	{/if}
</div>
<PasswordField
	label={t('settings-encryption-confirm-field')}
	showLabel
	bind:value={confirmation}
	placeholder={t('settings-encryption-type-again')}
	autocomplete="new-password"
	error={mismatch}
	live
	onkeydown={enter}
/>
