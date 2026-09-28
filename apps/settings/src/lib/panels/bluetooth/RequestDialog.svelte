<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { answer, cancelPairing, type PairingRequest } from './api';

	interface Props {
		request: PairingRequest;
		onclose: () => void;
	}

	let { request, onclose }: Props = $props();

	let value = $state('');

	let name = $derived(request.name || 'the device');
	let asksForValue = $derived(request.kind === 'pin' || request.kind === 'passkey');
	let ready = $derived(!asksForValue || (request.kind === 'passkey' ? /^\d{1,6}$/.test(value.trim()) : value.trim().length > 0));

	let copy = $derived(
		{
			confirm: { title: `Pair with ${name}?`, description: `Make sure ${name} shows the same code.`, accept: 'Pair' },
			authorize: { title: `Allow ${name} to pair?`, description: `${name} will be able to connect to this computer.`, accept: 'Allow' },
			pin: { title: `Enter the PIN for ${name}`, description: "It's often 0000 or 1234. The device's manual will have it if neither works.", accept: 'Pair' },
			passkey: { title: `Enter the code shown on ${name}`, description: 'Type the six digits exactly as they appear.', accept: 'Pair' },
			display: { title: `Pair with ${name}`, description: `Type this code on ${name}, then press Enter.`, accept: null }
		}[request.kind]
	);

	function respond(accepted: boolean) {
		if (request.kind === 'display') {
			if (!accepted) void cancelPairing(request.device);
		} else {
			void answer(request.id, accepted ? value.trim() : null);
		}
		onclose();
	}
</script>

<Dialog title={copy.title} description={copy.description} onclose={() => respond(false)}>
	{#if request.code}
		<p class="code">{request.code}</p>
	{/if}
	{#if asksForValue}
		<input
			class="text-field"
			inputmode={request.kind === 'passkey' ? 'numeric' : 'text'}
			autocomplete="off"
			bind:value
			onkeydown={(event) => event.key === 'Enter' && ready && respond(true)}
		/>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={() => respond(false)}>Cancel</button>
		{#if copy.accept}
			<button type="button" class="button primary" disabled={!ready} onclick={() => respond(true)}>{copy.accept}</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.code {
		padding: 10px 0;
		font-size: 34px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.08em;
		text-align: center;
		color: var(--text);
		user-select: text;
	}
</style>
