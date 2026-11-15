<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { KeyRequest } from '#lib/encryption.svelte.js';
	import { volumeName } from '#lib/format.js';
	import KeyPrompt from './KeyPrompt.svelte';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	const request = new KeyRequest();

	let working = $state(false);
	let error = $state('');

	async function submit() {
		working = true;
		error = '';
		try {
			if (await request.run((unlock) => commands.trustDecrypt({ block: volume.block, unlock }, WAIT))) onclose();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) error = message;
		} finally {
			working = false;
		}
	}
</script>

<Dialog
	title={t('disks-encryption-turn-off-title', { name: volumeName(volume) })}
	description={t('disks-encryption-turn-off-description')}
	{onclose}
>
	{#if request.asking}
		<KeyPrompt {request} onsubmit={submit} />
	{/if}
	{#if error}
		<p class="px-1 text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={working} onclick={onclose}>{t('disks-cancel')}</button>
		<button type="button" class="button danger" disabled={working || (request.asking && !request.key)} onclick={submit}>{t('disks-encryption-turn-off')}</button>
	{/snippet}
</Dialog>
