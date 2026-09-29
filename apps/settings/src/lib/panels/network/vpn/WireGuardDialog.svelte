<script lang="ts">
	import { Dialog, PasswordField, Row, TextField } from '@luft/ui';
	import { addWireGuard, wireGuardKeys, wireGuardPublicKey } from '../api';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const KEY_LENGTH = 44;
	const EVERYTHING = '0.0.0.0/0, ::/0';

	let name = $state('');
	let privateKey = $state('');
	let publicKey = $state('');
	let addresses = $state('');
	let dns = $state('');
	let serverKey = $state('');
	let endpoint = $state('');
	let allowedIps = $state(EVERYTHING);
	let presharedKey = $state('');
	let keepalive = $state('');
	let copied = $state(false);
	let busy = $state(false);
	let problem = $state('');

	let errors = $derived(check());
	let ready = $derived(!busy && Object.keys(errors).length === 0);

	$effect(() => {
		const key = privateKey.trim();
		publicKey = '';
		copied = false;
		if (key.length !== KEY_LENGTH) return;
		wireGuardPublicKey(key).then(
			(derived) => privateKey.trim() === key && (publicKey = derived),
			() => {}
		);
	});

	function list(text: string) {
		return text
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	function check() {
		const errors: Record<string, string> = {};
		if (!name.trim()) errors.name = 'Enter a name';
		if (privateKey.trim().length !== KEY_LENGTH) errors.privateKey = 'Enter or generate a private key';
		if (list(addresses).length === 0) errors.addresses = 'Enter at least one address';
		if (serverKey.trim().length !== KEY_LENGTH) errors.serverKey = 'Enter the server’s public key';
		if (!endpoint.trim()) errors.endpoint = 'Enter the server’s address and port';
		if (list(allowedIps).length === 0) errors.allowedIps = 'Enter at least one range';
		if (keepalive && !/^\d+$/.test(keepalive.trim())) errors.keepalive = 'Enter a number of seconds';
		return errors;
	}

	async function copyPublicKey() {
		await navigator.clipboard.writeText(publicKey);
		copied = true;
	}

	async function generate() {
		const keys = await wireGuardKeys();
		privateKey = keys.privateKey;
	}

	async function submit() {
		if (!ready) return;
		busy = true;
		problem = '';
		try {
			await addWireGuard({
				name: name.trim(),
				privateKey: privateKey.trim(),
				addresses: list(addresses),
				dns: list(dns),
				mtu: null,
				listenPort: null,
				peers: [
					{
						publicKey: serverKey.trim(),
						presharedKey: presharedKey.trim(),
						endpoint: endpoint.trim(),
						allowedIps: list(allowedIps),
						keepalive: keepalive.trim() ? Number(keepalive) : null
					}
				]
			});
			onclose();
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
			busy = false;
		}
	}
</script>

<Dialog title="Set up WireGuard" description="Your VPN provider or the server’s owner can give you these details." wide {onclose}>
	<div class="fields">
		<Row title="Name">
			<div class="w-[260px]"><TextField label="Name" bind:value={name} placeholder="Home VPN" error={errors.name} /></div>
		</Row>
		<Row title="Private key" description={publicKey ? `Your public key is ${publicKey}` : 'Its public key shows up here, to share with the server'}>
			<div class="flex w-[260px] flex-col items-end gap-2">
				<PasswordField label="Private key" bind:value={privateKey} error={errors.privateKey} />
				<div class="flex gap-2">
					{#if publicKey}
						<button type="button" class="button" onclick={copyPublicKey}>{copied ? 'Copied' : 'Copy public key'}</button>
					{/if}
					<button type="button" class="button" onclick={generate}>Generate a new key</button>
				</div>
			</div>
		</Row>
		<Row title="Addresses" description="This computer’s addresses inside the VPN">
			<div class="w-[260px]"><TextField label="Addresses" bind:value={addresses} placeholder="10.0.0.2/32" error={errors.addresses} /></div>
		</Row>
		<Row title="DNS servers">
			<div class="w-[260px]"><TextField label="DNS servers" bind:value={dns} placeholder="Optional" /></div>
		</Row>
		<Row title="Server public key">
			<div class="w-[260px]"><TextField label="Server public key" bind:value={serverKey} error={errors.serverKey} /></div>
		</Row>
		<Row title="Server address">
			<div class="w-[260px]">
				<TextField label="Server address" bind:value={endpoint} placeholder="vpn.example.com:51820" error={errors.endpoint} />
			</div>
		</Row>
		<Row title="Allowed IPs" description="Traffic to these ranges goes through the VPN">
			<div class="w-[260px]"><TextField label="Allowed IPs" bind:value={allowedIps} error={errors.allowedIps} /></div>
		</Row>
		<Row title="Preshared key">
			<div class="w-[260px]"><PasswordField label="Preshared key" bind:value={presharedKey} placeholder="Optional" /></div>
		</Row>
		<Row title="Keepalive" description="Helps the connection stay up behind a router">
			<div class="w-[260px]">
				<TextField label="Keepalive" bind:value={keepalive} placeholder="Optional, in seconds" inputmode="numeric" error={errors.keepalive} />
			</div>
		</Row>
	</div>
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{busy ? 'Adding…' : 'Add'}</button>
	{/snippet}
</Dialog>

<style>
	.fields {
		display: flex;
		flex-direction: column;
		margin-inline: -16px;
	}

	.fields > :global(* + *) {
		box-shadow: inset 0 1px 0 var(--hairline);
	}
</style>
