<script lang="ts">
	import { t } from '@luft/i18n';
	import type { OpenedFile } from '#lib/bindings.js';
	import { fullAccessAbilities } from '#lib/app/fullAccess.js';
	import { describe } from '#lib/app/permissions.js';
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';
	import SourceTrustDialog from '#lib/components/SourceTrustDialog.svelte';
	import type { Consent } from '#lib/files/install.svelte.js';

	let { consent, file, onconfirm, onclose }: { consent: Consent; file: OpenedFile; onconfirm: () => void; onclose: () => void } = $props();
</script>

{#if consent === 'source' && file.kind === 'package' && file.repository}
	<SourceTrustDialog source={file.repository} confirm={t('file-add-and-install')} {onconfirm} {onclose} />
{:else if consent === 'unsandboxed' && file.kind === 'appImage' && file.unsandboxed}
	<ConsentDialog
		title={t('file-full-access-title', { name: file.name })}
		description={t('file-full-access-description', { name: file.name, reason: file.unsandboxed })}
		facts={fullAccessAbilities()}
		confirm={t('file-full-access-confirm')}
		danger
		{onconfirm}
		{onclose}
	/>
{:else if consent === 'unverified' && file.kind === 'package'}
	<ConsentDialog
		title={t('file-unverified-title', { name: file.package })}
		description={t('file-unverified-description')}
		facts={[t('file-unverified-fact'), t('file-for-everyone-fact'), t('file-administrator-fact'), t('file-no-updates-fact')]}
		confirm={t('file-install-anyway')}
		danger
		{onconfirm}
		{onclose}
	/>
{:else if consent === 'broad' && file.kind === 'flatpakBundle' && file.permissions}
	<ConsentDialog
		title={t('consent-flathub-title', { name: file.title })}
		description={t('consent-flathub-description', { name: file.title })}
		access={describe(file.permissions)}
		confirm={t('consent-install')}
		{onconfirm}
		{onclose}
	/>
{/if}
