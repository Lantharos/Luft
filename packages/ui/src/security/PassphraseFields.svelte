<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from '@luft/i18n';
	import PasswordField from '../controls/PasswordField.svelte';

	interface Props {
		passphrase: string;
		confirmation: string;
		minimum: number;
		onsubmit?: () => void;
		/** Shown under the passphrase, such as how strong it is. */
		children?: Snippet;
	}

	let { passphrase = $bindable(), confirmation = $bindable(), minimum, onsubmit, children }: Props = $props();

	let mismatch = $derived(confirmation.length >= passphrase.length && confirmation !== passphrase ? t('ui-passphrase-mismatch') : '');

	const enter = (event: KeyboardEvent) => event.key === 'Enter' && onsubmit?.();
</script>

<div class="flex flex-col gap-2">
	<PasswordField
		label={t('ui-passphrase-field')}
		showLabel
		bind:value={passphrase}
		placeholder={t('ui-passphrase-length', { min: minimum })}
		autocomplete="new-password"
		live
		onkeydown={enter}
	/>
	{@render children?.()}
</div>
<PasswordField
	label={t('ui-passphrase-confirm')}
	showLabel
	bind:value={confirmation}
	placeholder={t('ui-passphrase-type-again')}
	autocomplete="new-password"
	error={mismatch}
	live
	onkeydown={enter}
/>
