<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import PasskeysSection from '../passkeys/PasskeysSection.svelte';
	import AccessPage from './access/AccessPage.svelte';
	import SshSection from './ssh/SshSection.svelte';
	import type { KeyringState } from './state.svelte';
	import StatusSection from './StatusSection.svelte';

	interface Props {
		keyring: KeyringState;
		fingerprintReader: boolean;
		onclose: () => void;
	}

	let { keyring, fingerprintReader, onclose }: Props = $props();

	let browsingAccess = $state(false);

	let access = $derived(keyring.current && !keyring.current.locked ? keyring.current.access : null);

	$effect(() => {
		if (!access) browsingAccess = false;
	});
</script>

{#if browsingAccess && access}
	<AccessPage {access} refresh={keyring.load} onclose={() => (browsingAccess = false)} />
{:else}
	<SubPage title={t('settings-passwords-title')} back={t('settings-page-security')} {onclose}>
		{#if keyring.current === null}
			<Section>
				<Row title={t('settings-passwords-not-running')} description={t('settings-passwords-not-running-description')} />
			</Section>
		{:else if keyring.current}
			<StatusSection keyring={keyring.current} {fingerprintReader} refresh={keyring.load} onaccess={() => (browsingAccess = true)} />

			{#if keyring.current.ssh}
				<SshSection ssh={keyring.current.ssh} refresh={keyring.load} />
			{/if}
		{/if}

		<PasskeysSection {fingerprintReader} />
	</SubPage>
{/if}
