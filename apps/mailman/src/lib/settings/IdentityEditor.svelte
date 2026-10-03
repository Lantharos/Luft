<script lang="ts">
	import { TextField } from '@luft/ui';
	import * as api from '#lib/api/index.js';
	import type { Identity } from '#lib/api/index.js';
	import { signatureHtml } from '#lib/compose/html.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';

	interface Props {
		identity: Identity;
		onclose: () => void;
	}

	let { identity, onclose }: Props = $props();

	const ADDRESS = /^(\*|[^\s@<>]+)@[^\s@<>]+\.[^\s@<>]+$/;

	let name = $derived(identity.name);
	let address = $derived(identity.address);
	let replyTo = $derived(identity.replyTo);
	let signature = $derived(identity.signature);
	let saving = $state(false);

	let fixed = $derived(identity.remote !== null);
	let valid = $derived(ADDRESS.test(address.trim()) && (!replyTo.trim() || ADDRESS.test(replyTo.trim())));
	let preview = $derived(signature.trim() ? signatureHtml(signature) : '');
	let removable = $derived(identity.id !== 0 && !identity.preferred);

	async function save(preferred = identity.preferred) {
		if (!valid || saving) return;
		saving = true;
		try {
			await api.saveIdentity({ ...identity, name: name.trim(), address: address.trim().toLowerCase(), replyTo: replyTo.trim(), signature, preferred });
			await mail.reloadIdentities();
			onclose();
		} catch (error) {
			toasts.fail(error);
		} finally {
			saving = false;
		}
	}

	async function remove() {
		await api.removeIdentity(identity.id).catch(toasts.fail);
		await mail.reloadIdentities();
		onclose();
	}
</script>

<div class="editor">
	<div class="grid grid-cols-2 gap-3">
		<TextField bind:value={name} label="Name" showLabel />
		<TextField bind:value={address} label="Address" showLabel disabled={fixed} placeholder="you@example.com" invalid={!!address.trim() && !ADDRESS.test(address.trim())} />
	</div>
	<TextField bind:value={replyTo} label="Replies go to" showLabel placeholder="The same address" invalid={!!replyTo.trim() && !ADDRESS.test(replyTo.trim())} />
	<label class="flex flex-col gap-1.5">
		<span class="px-1 text-[13px] text-[var(--text-soft)]">Signature</span>
		<textarea bind:value={signature} rows="3" class="signature-field" placeholder="Added below messages sent from this address"></textarea>
	</label>
	{#if preview}
		<div class="preview" aria-label="How the signature looks">
			<p>Your message</p>
			<div class="signature">{@html preview}</div>
		</div>
	{/if}
	<div class="flex gap-2">
		<button type="button" class="button primary" disabled={!valid || saving} onclick={() => void save()}>Save</button>
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<span class="flex-1"></span>
		{#if identity.id !== 0 && !identity.preferred}
			<button type="button" class="button" onclick={() => void save(true)}>Send from this by default</button>
		{/if}
		{#if removable}
			<button type="button" class="button danger" onclick={() => void remove()}>Remove</button>
		{/if}
	</div>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-radius: 18px;
		background: var(--surface);
		padding: 14px;
	}

	.signature-field {
		resize: none;
		border-radius: 16px;
		background: var(--control);
		padding: 10px 14px;
		font-size: 13px;
		line-height: 1.5;
		outline: none;
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	.signature-field:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: 10px;
		border-radius: 16px;
		background: var(--popover);
		padding: 14px 16px;
		font-size: 14px;
		line-height: 1.55;
	}

	.preview .signature {
		color: var(--text-muted);
		overflow-wrap: anywhere;
	}
</style>
