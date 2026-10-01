<script lang="ts">
	import { TextField } from '@luft/ui';
	import { PIN_LENGTH, pinProblem } from './pin';

	interface Props {
		pin: string;
		confirmation: string;
		label?: string;
		onsubmit?: () => void;
	}

	let { pin = $bindable(), confirmation = $bindable(), label = 'PIN', onsubmit }: Props = $props();

	let touched = $state(false);

	let problem = $derived(pinProblem(pin) || (pin.length < PIN_LENGTH.min ? `Use at least ${PIN_LENGTH.min} digits` : ''));
	let mismatch = $derived(confirmation.length >= pin.length && confirmation !== pin ? 'The PINs don’t match' : '');

	const enter = (event: KeyboardEvent) => event.key === 'Enter' && onsubmit?.();
</script>

<TextField
	{label}
	showLabel
	type="password"
	inputmode="numeric"
	placeholder="{PIN_LENGTH.min} to {PIN_LENGTH.max} digits"
	bind:value={pin}
	bind:touched
	error={problem}
	live={Boolean(pinProblem(pin))}
	onkeydown={enter}
/>
<TextField label="Confirm" showLabel type="password" inputmode="numeric" placeholder="Type it again" bind:value={confirmation} error={mismatch} live onkeydown={enter} />
