<script lang="ts">
	import { onDestroy } from 'svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import { Row, Section } from '@luft/ui';
	import AccessSection from './keyring/AccessSection.svelte';
	import { keyring, onKeyring, type Keyring } from './keyring/api';
	import HistorySection from './keyring/HistorySection.svelte';
	import SshSection from './keyring/SshSection.svelte';
	import StatusSection from './keyring/StatusSection.svelte';
	import StoresSection from './keyring/StoresSection.svelte';

	let current = $state<Keyring | null | undefined>();

	const stop = onKeyring((next) => (current = next));
	onDestroy(stop);

	async function load() {
		current = await keyring().catch(() => null);
	}

	void load();
</script>

{#if current === null}
	<Section title="Passwords and keys">
		<Row title="Your keyring isn’t running" description="Your saved passwords and keys show up here once it starts" icon={KeyRound} />
	</Section>
{:else if current}
	<StatusSection keyring={current} refresh={load} />

	{#if current.access}
		<AccessSection apps={current.access.apps} locked={current.locked} refresh={load} />
		{#if current.access.stores.length}
			<StoresSection stores={current.access.stores} refresh={load} />
		{/if}
	{/if}

	{#if current.ssh}
		<SshSection ssh={current.ssh} refresh={load} />
	{/if}

	{#if current.access?.history.length}
		<HistorySection history={current.access.history} refresh={load} />
	{/if}
{/if}
