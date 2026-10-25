<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import PasskeysSection from '../passkeys/PasskeysSection.svelte';
	import AccessPage from './access/AccessPage.svelte';
	import { keyringAccess, type Access } from './api';
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

	$effect(() => {
		if (!unlocked) access = null;
	});

	async function loadAccess() {
		access = await keyringAccess().catch(() => null);
	}
</script>

{#if access && unlocked}
	<AccessPage {access} refresh={loadAccess} onclose={() => (access = null)} />
{:else}
	<SubPage title={t('settings-passwords-title')} back={t('settings-page-security')} {onclose}>
		{#if keyring.current === null}
			<Section>
				<Row title={t('settings-passwords-not-running')} description={t('settings-passwords-not-running-description')} />
			</Section>
		{:else if keyring.current}
			<StatusSection keyring={keyring.current} {fingerprintReader} refresh={keyring.load} onaccess={loadAccess} />

			{#if keyring.current.ssh}
				<SshSection ssh={keyring.current.ssh} refresh={keyring.load} />
			{/if}
		{/if}

		<PasskeysSection {fingerprintReader} />
	</SubPage>
{/if}
