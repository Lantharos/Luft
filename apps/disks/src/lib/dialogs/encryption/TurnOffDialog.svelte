<script lang="ts">
	import { Dialog } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Volume } from '$lib/api';
	import { KeyRequest } from '$lib/encryption.svelte';
	import { errorText, volumeName } from '$lib/format';
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
			if (await request.run((unlock) => api.trust.decrypt(volume.block, unlock))) onclose();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== api.CANCELLED) error = message;
		} finally {
			working = false;
		}
	}
</script>

<Dialog
	title="Turn off encryption for “{volumeName(volume)}”?"
	description="It’s decrypted in the background while you keep using it. Afterwards, anyone who has the drive can read what’s on it."
	{onclose}
>
	{#if request.asking}
		<KeyPrompt {request} onsubmit={submit} />
	{/if}
	{#if error}
		<p class="px-1 text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={working} onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" disabled={working || (request.asking && !request.key)} onclick={submit}>Turn off encryption</button>
	{/snippet}
</Dialog>
