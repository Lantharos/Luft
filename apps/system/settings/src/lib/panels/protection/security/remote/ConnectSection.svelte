<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Fingerprint from '@lucide/svelte/icons/fingerprint-pattern';
	import Network from '@lucide/svelte/icons/network';
	import Terminal from '@lucide/svelte/icons/terminal';
	import { i18n, t } from '@luft/i18n';
	import { IconButton, Row, Section } from '@luft/ui';
	import type { RemoteLogin } from '#lib/bindings.js';
	import HostKeysDialog from './HostKeysDialog.svelte';

	const COPIED_FOR = 2000;

	let { current, account, addresses }: { current: RemoteLogin; account: string; addresses: string[] } = $props();

	let copied = $state('');
	let checking = $state(false);

	let command = $derived(`ssh ${account}@${current.hostname}.local`);
	let listed = $derived(new Intl.ListFormat(i18n.formats, { type: 'unit' }).format(addresses));

	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = text;
		setTimeout(() => {
			if (copied === text) copied = '';
		}, COPIED_FOR);
	}
</script>

<Section title={t('settings-remote-login-connect')} description={t('settings-remote-login-connect.description')}>
	<Row title={command} icon={Terminal}>
		<IconButton icon={copied === command ? Check : Copy} label={t('settings-remote-login-copy', { text: command })} onclick={() => copy(command)} />
	</Row>
	{#if addresses.length}
		<Row title={t('settings-remote-login-addresses')} description={listed} icon={Network} />
	{/if}
	<Row title={t('settings-remote-login-host-keys')} description={t('settings-remote-login-host-keys-description')} icon={Fingerprint} onclick={() => (checking = true)} />
</Section>

{#if checking}
	<HostKeysDialog keys={current.hostKeys} onclose={() => (checking = false)} />
{/if}
