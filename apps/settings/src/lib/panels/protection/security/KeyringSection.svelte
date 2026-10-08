<script lang="ts">
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
	<Section title="Passwords and keys">
		<Row title="Your keyring isn’t running" description="Your passwords and keys show up here once it starts" />
	</Section>
{:else if keyring.current}
	<StatusSection keyring={keyring.current} {fingerprintReader} refresh={keyring.load} {onaccess} />

	{#if keyring.current.ssh}
		<SshSection ssh={keyring.current.ssh} refresh={keyring.load} />
	{/if}
{/if}
