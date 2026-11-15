<script lang="ts">
	import { t } from '@luft/i18n';
	import { fullAccessAbilities } from '#lib/app/fullAccess.js';
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
	<SourceTrustDialog source={install.source} confirm={t('file-add-and-install')} onconfirm={() => install.agree()} onclose={() => install.decline()} />
{:else if install.asking === 'unsandboxed' && file?.kind === 'appImage' && file.unsandboxed}
	<ConsentDialog
		title={t('file-full-access-title', { name: file.name })}
		description={t('file-full-access-description', { name: file.name, reason: file.unsandboxed })}
		facts={fullAccessAbilities()}
		confirm={t('file-full-access-confirm')}
		danger
		onconfirm={() => install.agree()}
		onclose={() => install.decline()}
	/>
{:else if install.asking === 'unverified' && file?.kind === 'package'}
	<ConsentDialog
		title={t('file-unverified-title', { name: file.package })}
		description={t('file-unverified-description')}
		facts={file.system
			? [t('file-unverified-fact'), t('file-for-everyone-fact'), t('file-administrator-fact'), t('file-no-updates-fact')]
			: [t('file-unverified-fact'), t('file-for-you-fact'), t('file-no-updates-fact')]}
		confirm={t('file-install-anyway')}
		danger
		onconfirm={() => install.agree()}
		onclose={() => install.decline()}
	/>
{:else if install.asking === 'broad' && file?.kind === 'flatpakBundle' && file.permissions}
	<ConsentDialog
		title={t('consent-flathub-title', { name: file.title })}
		description={t('consent-flathub-description', { name: file.title })}
		access={describe(file.permissions)}
		confirm={t('consent-install')}
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
