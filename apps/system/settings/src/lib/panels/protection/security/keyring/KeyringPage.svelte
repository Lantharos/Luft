<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import type { Access } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import AccessPage from './access/AccessPage.svelte';
	import { keyringAccess } from './api';
	import SshSection from './ssh/SshSection.svelte';
	import type { KeyringState } from './state.svelte';
	import StatusSection from './StatusSection.svelte';

	interface Props {
		keyring: KeyringState;
		fingerprintReader: boolean;
		onclose: () => void;
	}

	let { keyring, fingerprintReader, onclose }: Props = $props();

	let access = $state<Access | null>(null);
	let unlocked = $derived(!!keyring.current && !keyring.current.locked);
	let latestAccessRequest = 0;

	$effect(() => {
		if (!unlocked) closeAccess();
	});

	function closeAccess() {
		latestAccessRequest++;
		access = null;
	}

	async function loadAccess() {
		const asked = ++latestAccessRequest;
		const loaded = await keyringAccess().catch(() => null);
		if (asked === latestAccessRequest && unlocked) access = loaded;
	}
</script>

{#if access && unlocked}
	<AccessPage {access} refresh={loadAccess} onclose={closeAccess} />
{:else}
	<SubPage title={t('settings-passwords-title')} {onclose}>
		{#if keyring.current === null}
			<Section>
				<Row title={t('settings-passwords-not-running')} />
			</Section>
		{:else if keyring.current}
			<StatusSection keyring={keyring.current} {fingerprintReader} refresh={keyring.load} onaccess={loadAccess} />

			{#if keyring.current.ssh}
				<SshSection ssh={keyring.current.ssh} refresh={keyring.load} />
			{/if}
		{/if}
	</SubPage>
{/if}
