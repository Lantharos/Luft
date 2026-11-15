<script lang="ts">
	import { FULL_ACCESS_ABILITIES } from '#lib/app/fullAccess.js';
	import { describe } from '#lib/app/permissions.js';
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';
	import FlathubConsent from '#lib/components/FlathubConsent.svelte';
	import SourceTrustDialog from '#lib/components/SourceTrustDialog.svelte';
	import StoreConsent from '#lib/pages/app/StoreConsent.svelte';
	import type { FileInstall } from './install.svelte.js';

	let { install }: { install: FileInstall } = $props();

	const file = $derived(install.file);
</script>

{#if install.asking === 'source' && install.source}
	<SourceTrustDialog source={install.source} confirm="Add and install" onconfirm={() => install.agree()} onclose={() => install.decline()} />
{:else if install.asking === 'unsandboxed' && file?.kind === 'appImage' && file.unsandboxed}
	<ConsentDialog
		title="Give {file.name} full access?"
		description="{file.name} asks to run outside a sandbox: “{file.unsandboxed}” There it can do all of this without asking. You can take full access away on its page later."
		facts={FULL_ACCESS_ABILITIES}
		confirm="Install with full access"
		danger
		onconfirm={() => install.agree()}
		onclose={() => install.decline()}
	/>
{:else if install.asking === 'unverified' && file?.kind === 'package'}
	<ConsentDialog
		title="Install {file.package} without checking it?"
		description="It isn't signed by Fedora or a software source you added. Only install it if you trust whoever gave it to you."
		facts={file.system
			? ['Not verified', 'Installs for everyone on this computer', 'Can run as administrator while it installs', "Won't get updates"]
			: ['Not verified', 'Installs for you only, but can read and change your files', "Won't get updates"]}
		confirm="Install anyway"
		danger
		onconfirm={() => install.agree()}
		onclose={() => install.decline()}
	/>
{:else if install.asking === 'broad' && file?.kind === 'flatpakBundle' && file.permissions}
	<ConsentDialog
		title="Install {file.title}?"
		description="{file.title} runs in a sandbox, but asks for more than most apps need. It can use:"
		access={describe(file.permissions)}
		confirm="Install"
		onconfirm={() => install.agree()}
		onclose={() => install.decline()}
	/>
{/if}

{#if install.askingStore && install.listed?.store}
	<StoreConsent store={install.listed.store} onconfirm={(fullAccess) => install.agreeToStore(fullAccess)} onclose={() => (install.askingStore = false)} />
{/if}

{#if install.flathubAccess && install.listed}
	<FlathubConsent
		name={install.listed.listing.name}
		access={install.flathubAccess}
		onconfirm={() => install.installFromFlathub()}
		onclose={() => (install.flathubAccess = null)}
	/>
{/if}
