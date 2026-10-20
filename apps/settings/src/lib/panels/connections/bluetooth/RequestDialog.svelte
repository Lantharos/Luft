<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { answer, cancelPairing, type PairingRequest } from './api';

	interface Props {
		request: PairingRequest;
		onclose: () => void;
	}

	let { request, onclose }: Props = $props();

	let value = $state('');

	let name = $derived(request.name || t('settings-bluetooth-request-unnamed'));
	let asksForValue = $derived(request.kind === 'pin' || request.kind === 'passkey');
	let ready = $derived(!asksForValue || (request.kind === 'passkey' ? /^\d{1,6}$/.test(value.trim()) : value.trim().length > 0));

	let copy = $derived(
		{
			confirm: {
				title: t('settings-bluetooth-request-confirm', { name }),
				description: t('settings-bluetooth-request-confirm.description', { name }),
				accept: t('settings-bluetooth-pair')
			},
			authorize: {
				title: t('settings-bluetooth-request-authorize', { name }),
				description: t('settings-bluetooth-request-authorize.description', { name }),
				accept: t('settings-bluetooth-allow')
			},
			pin: {
				title: t('settings-bluetooth-request-pin', { name }),
				description: t('settings-bluetooth-request-pin.description'),
				accept: t('settings-bluetooth-pair')
			},
			passkey: {
				title: t('settings-bluetooth-request-passkey', { name }),
				description: t('settings-bluetooth-request-passkey.description'),
				accept: t('settings-bluetooth-pair')
			},
			display: {
				title: t('settings-bluetooth-request-display', { name }),
				description: t('settings-bluetooth-request-display.description', { name }),
				accept: null
			}
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
		<button type="button" class="button" onclick={() => respond(false)}>{t('settings-bluetooth-cancel')}</button>
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
