<script lang="ts">
	import { onDestroy } from 'svelte';
	import { app } from '#lib/state/app.svelte.js';
	import EncryptionPage from './encryption/EncryptionPage.svelte';
	import UnlockDialog from './encryption/UnlockDialog.svelte';
	import { unlockPrompt } from './encryption/unlock.svelte';
	import KeyringPage from './keyring/KeyringPage.svelte';
	import { KeyringState } from './keyring/state.svelte';
	import Overview from './Overview.svelte';
	import ProtectionsPage from './protections/ProtectionsPage.svelte';
	import { SecurityState } from './state.svelte';

	const security = new SecurityState();
	const keyring = new KeyringState();

	const close = () => (app.section = null);

	void security.start();
	void keyring.load();
	onDestroy(() => {
		security.stop();
		keyring.stop();
	});
</script>

{#if security.loaded && app.section === 'protections'}
	<ProtectionsPage {security} onclose={close} />
{:else if security.trust && app.section === 'encryption'}
	<EncryptionPage trust={security.trust} onclose={close} />
{:else if app.section === 'keyring'}
	<KeyringPage {keyring} fingerprintReader={security.fingerprintReader} onclose={close} />
{:else}
	<Overview {security} {keyring} onopen={(page) => (app.section = page)} />
{/if}

{#if unlockPrompt.request}
	<UnlockDialog rejected={unlockPrompt.request.rejected} />
{/if}
