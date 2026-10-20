<script lang="ts">
	import { t } from '@luft/i18n';
	import { TextField } from '@luft/ui';
	import { PIN_LENGTH, pinProblem } from './pin';

	interface Props {
		pin: string;
		confirmation: string;
		label?: string;
		onsubmit?: () => void;
	}

	let { pin = $bindable(), confirmation = $bindable(), label, onsubmit }: Props = $props();

	let touched = $state(false);

	let problem = $derived(pinProblem(pin) || (pin.length < PIN_LENGTH.min ? t('settings-encryption-pin-too-short', { min: PIN_LENGTH.min }) : ''));
	let mismatch = $derived(confirmation.length >= pin.length && confirmation !== pin ? t('settings-encryption-pins-differ') : '');

	const enter = (event: KeyboardEvent) => event.key === 'Enter' && onsubmit?.();
</script>

<TextField
	label={label ?? t('settings-encryption-pin-field')}
	showLabel
	type="password"
	inputmode="numeric"
	placeholder={t('settings-encryption-pin-length', PIN_LENGTH)}
	bind:value={pin}
	bind:touched
	error={problem}
	live={Boolean(pinProblem(pin))}
	onkeydown={enter}
/>
<TextField
	label={t('settings-encryption-confirm-field')}
	showLabel
	type="password"
	inputmode="numeric"
	placeholder={t('settings-encryption-type-again')}
	bind:value={confirmation}
	error={mismatch}
	live
	onkeydown={enter}
/>
