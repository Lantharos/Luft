<script lang="ts">
	import { PasswordField } from '@luft/ui';
	import StrengthMeter from '#lib/panels/users/StrengthMeter.svelte';
	import { MINIMUM_LENGTH, measure } from '#lib/panels/users/strength.js';

	interface Props {
		passphrase: string;
		confirmation: string;
		onsubmit?: () => void;
	}

	let { passphrase = $bindable(), confirmation = $bindable(), onsubmit }: Props = $props();

	let strength = $derived(passphrase ? measure(passphrase, []) : null);
	let mismatch = $derived(confirmation.length >= passphrase.length && confirmation !== passphrase ? 'The passphrases don’t match' : '');

	const enter = (event: KeyboardEvent) => event.key === 'Enter' && onsubmit?.();
</script>

<div class="flex flex-col gap-2">
	<PasswordField label="Passphrase" showLabel bind:value={passphrase} placeholder="At least {MINIMUM_LENGTH} characters" autocomplete="new-password" live onkeydown={enter} />
	{#if strength}
		<StrengthMeter {strength} />
	{/if}
</div>
<PasswordField label="Confirm" showLabel bind:value={confirmation} placeholder="Type it again" autocomplete="new-password" error={mismatch} live onkeydown={enter} />
