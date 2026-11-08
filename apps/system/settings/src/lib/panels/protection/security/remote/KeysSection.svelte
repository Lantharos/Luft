<script lang="ts">
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash from '@lucide/svelte/icons/trash';
	import { t } from '@luft/i18n';
	import { ConfirmDialog, IconButton, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { AuthorizedKey } from '#lib/bindings.js';
	import AddKeyDialog from './AddKeyDialog.svelte';
	import { keyKind, keyName } from './describe';
	import type { RemoteLoginState } from './state.svelte';

	let { remote }: { remote: RemoteLoginState } = $props();

	let adding = $state(false);
	let removing = $state<AuthorizedKey | null>(null);

	async function remove(key: AuthorizedKey) {
		await commands.remoteLoginRemoveKey({ fingerprint: key.fingerprint });
		await remote.refreshKeys();
	}
</script>

<Section title={t('settings-remote-login-keys')} description={t('settings-remote-login-keys.description', { account: remote.me?.userName ?? '' })}>
	{#each remote.keys as key (key.fingerprint)}
		<Row title={keyName(key)} description={`${keyKind(key.kind)} · ${key.fingerprint}`} icon={KeyRound} truncate>
			<IconButton icon={Trash} label={t('settings-remote-login-key-remove', { name: keyName(key) })} onclick={() => (removing = key)} />
		</Row>
	{/each}
	<Row title={t('settings-remote-login-key-add')} icon={Plus} onclick={() => (adding = true)} />
</Section>

{#if adding}
	<AddKeyDialog refresh={remote.refreshKeys} onclose={() => (adding = false)} />
{/if}

{#if removing}
	{@const key = removing}
	<ConfirmDialog
		title={t('settings-remote-login-key-remove-title', { name: keyName(key) })}
		description={t('settings-remote-login-key-remove-description')}
		action={t('settings-protection-remove')}
		danger
		run={() => remove(key)}
		onclose={() => (removing = null)}
	/>
{/if}
