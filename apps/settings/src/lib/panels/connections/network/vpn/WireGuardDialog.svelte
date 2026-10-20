<script lang="ts">
	import { t } from '@luft/i18n';
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
		if (!name.trim()) errors.name = t('settings-network-error-name');
		if (privateKey.trim().length !== KEY_LENGTH) errors.privateKey = t('settings-network-wireguard-error-private-key');
		if (list(addresses).length === 0) errors.addresses = t('settings-network-wireguard-error-addresses');
		if (serverKey.trim().length !== KEY_LENGTH) errors.serverKey = t('settings-network-wireguard-error-server-key');
		if (!endpoint.trim()) errors.endpoint = t('settings-network-wireguard-error-endpoint');
		if (list(allowedIps).length === 0) errors.allowedIps = t('settings-network-wireguard-error-allowed-ips');
		if (keepalive && !/^\d+$/.test(keepalive.trim())) errors.keepalive = t('settings-network-wireguard-error-keepalive');
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

<Dialog title={t('settings-network-wireguard')} description={t('settings-network-wireguard-dialog')} wide {onclose}>
	<div class="fields">
		<Row title={t('settings-network-name')}>
			<div class="w-[260px]">
				<TextField label={t('settings-network-name')} bind:value={name} placeholder={t('settings-network-wireguard-name-example')} error={errors.name} />
			</div>
		</Row>
		<Row
			title={t('settings-network-private-key')}
			description={publicKey ? t('settings-network-wireguard-public-key', { key: publicKey }) : t('settings-network-wireguard-public-key-pending')}
			truncate
		>
			<div class="flex w-[260px] flex-col items-end gap-2">
				<PasswordField label={t('settings-network-private-key')} bind:value={privateKey} error={errors.privateKey} />
				<div class="flex gap-2">
					{#if publicKey}
						<button type="button" class="button" onclick={copyPublicKey}>{copied ? t('settings-network-wireguard-copied') : t('settings-network-wireguard-copy')}</button>
					{/if}
					<button type="button" class="button" onclick={generate}>{t('settings-network-wireguard-generate')}</button>
				</div>
			</div>
		</Row>
		<Row title={t('settings-network-ip-addresses')} description={t('settings-network-wireguard-addresses')}>
			<div class="w-[260px]"><TextField label={t('settings-network-ip-addresses')} bind:value={addresses} placeholder="10.0.0.2/32" error={errors.addresses} /></div>
		</Row>
		<Row title={t('settings-network-dns-servers')}>
			<div class="w-[260px]"><TextField label={t('settings-network-dns-servers')} bind:value={dns} placeholder={t('settings-network-optional')} /></div>
		</Row>
		<Row title={t('settings-network-wireguard-server-key')}>
			<div class="w-[260px]"><TextField label={t('settings-network-wireguard-server-key')} bind:value={serverKey} error={errors.serverKey} /></div>
		</Row>
		<Row title={t('settings-network-wireguard-endpoint')}>
			<div class="w-[260px]">
				<TextField label={t('settings-network-wireguard-endpoint')} bind:value={endpoint} placeholder="vpn.example.com:51820" error={errors.endpoint} />
			</div>
		</Row>
		<Row title={t('settings-network-wireguard-allowed-ips')} description={t('settings-network-wireguard-allowed-ips.description')}>
			<div class="w-[260px]"><TextField label={t('settings-network-wireguard-allowed-ips')} bind:value={allowedIps} error={errors.allowedIps} /></div>
		</Row>
		<Row title={t('settings-network-wireguard-preshared-key')}>
			<div class="w-[260px]">
				<PasswordField label={t('settings-network-wireguard-preshared-key')} bind:value={presharedKey} placeholder={t('settings-network-optional')} />
			</div>
		</Row>
		<Row title={t('settings-network-wireguard-keepalive')} description={t('settings-network-wireguard-keepalive.description')}>
			<div class="w-[260px]">
				<TextField
					label={t('settings-network-wireguard-keepalive')}
					bind:value={keepalive}
					placeholder={t('settings-network-wireguard-keepalive.placeholder')}
					inputmode="numeric"
					error={errors.keepalive}
				/>
			</div>
		</Row>
	</div>
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-network-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{busy ? t('settings-network-wireguard-adding') : t('settings-network-wireguard-add')}</button>
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
