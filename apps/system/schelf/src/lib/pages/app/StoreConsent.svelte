<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { StoreDetails } from '#lib/bindings.js';
	import { fullAccessAbilities } from '#lib/app/fullAccess.js';
	import { abilities, insideLuftAbilities } from '#lib/app/extensionAccess.js';
	import { describe } from '#lib/app/permissions.js';
	import ConsentDialog from '#lib/components/ConsentDialog.svelte';

	interface Props {
		store: StoreDetails;
		updating?: boolean;
		movesInside?: boolean;
		onconfirm: (fullAccess: boolean) => void;
		onclose: () => void;
	}

	let { store, updating = false, movesInside = false, onconfirm, onclose }: Props = $props();

	const access = $derived(
		store.extension ? abilities(store.extension).map((ability) => ({ ...ability, description: '', notable: false })) : store.access ? describe(store.access) : null
	);
	const reason = $derived(store.declared?.unsandboxed);
	const size = $derived(store.size ?? store.download?.size ?? null);
	const note = $derived(size ? t('app-consent-size', { size: bytes(size) }) : undefined);
</script>

{#if movesInside}
	<ConsentDialog
		title={t('app-consent-inside-title', { name: store.name })}
		description={t('app-consent-inside-description', { name: store.name })}
		facts={insideLuftAbilities()}
		{note}
		confirm={t('app-consent-inside-confirm')}
		onconfirm={() => onconfirm(false)}
		{onclose}
	/>
{:else if access}
	<ConsentDialog
		title={t(updating ? 'app-consent-update-title' : 'app-consent-install-title', { name: store.name })}
		description={t(
			updating ? 'app-consent-update-description' : store.extension ? (store.inShell ? 'app-consent-approved' : 'app-consent-extension-sandboxed') : 'app-consent-sandboxed',
			{ name: store.name }
		)}
		{access}
		{note}
		confirm={t(updating ? 'app-consent-update' : 'app-consent-install')}
		onconfirm={() => onconfirm(false)}
		{onclose}
	/>
{:else}
	<ConsentDialog
		title={t(updating ? 'app-consent-update-full-title' : 'app-consent-install-full-title', { name: store.name })}
		description={store.installer === 'appimage'
			? reason
				? t('app-consent-full-declared-file', { name: store.name, reason })
				: t('app-consent-full-unsandboxed-file', { name: store.name })
			: reason
				? t('app-consent-full-declared', { name: store.name, reason })
				: t('app-consent-full-unsandboxed', { name: store.name })}
		facts={fullAccessAbilities()}
		{note}
		confirm={t(updating ? 'app-consent-update-full' : 'app-consent-install-full')}
		danger
		onconfirm={() => onconfirm(true)}
		{onclose}
	/>
{/if}
