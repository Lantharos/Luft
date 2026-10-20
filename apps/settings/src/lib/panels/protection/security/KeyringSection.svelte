<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import SshSection from './keyring/ssh/SshSection.svelte';
	import type { KeyringState } from './keyring/state.svelte';
	import StatusSection from './keyring/StatusSection.svelte';

	interface Props {
		keyring: KeyringState;
		fingerprintReader: boolean;
		onaccess: () => void;
	}

	let { keyring, fingerprintReader, onaccess }: Props = $props();
</script>

{#if keyring.current === null}
	<Section title={t('settings-passwords-title')}>
		<Row title={t('settings-passwords-not-running')} description={t('settings-passwords-not-running-description')} />
	</Section>
{:else if keyring.current}
	<StatusSection keyring={keyring.current} {fingerprintReader} refresh={keyring.load} {onaccess} />

	{#if keyring.current.ssh}
		<SshSection ssh={keyring.current.ssh} refresh={keyring.load} />
	{/if}
{/if}
