<script lang="ts">
	import { onDestroy } from 'svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash';
	import { t } from '@luft/i18n';
	import { ago, Dialog, errorText, IconButton, Row, Section } from '@luft/ui';
	import { accountLabel, deletePasskey, onPasskeys, passkeys, siteLabel, type Passkey, type Passkeys } from './api';
	import RenameDialog from './RenameDialog.svelte';

	const PROTECTION = {
		chip: { fingerprint: 'settings-passkeys-chip-fingerprint', password: 'settings-passkeys-chip-password' },
		password: { fingerprint: 'settings-passkeys-password-fingerprint', password: 'settings-passkeys-password' }
	} as const;

	let { fingerprintReader }: { fingerprintReader: boolean } = $props();

	let current = $state<Passkeys | null>(null);
	let renaming = $state<Passkey | null>(null);
	let removing = $state<Passkey | null>(null);
	let problem = $state('');

	let sorted = $derived(
		current ? [...current.passkeys].sort((a, b) => siteLabel(a).localeCompare(siteLabel(b)) || accountLabel(a).localeCompare(accountLabel(b))) : []
	);

	const stop = onPasskeys((next) => (current = next));
	onDestroy(stop);

	async function load() {
		current = await passkeys().catch(() => null);
	}

	function protection({ protection }: Passkeys) {
		if (protection === 'unavailable') return t('settings-passkeys-unavailable');
		return t(PROTECTION[protection][fingerprintReader ? 'fingerprint' : 'password']);
	}

	function details(passkey: Passkey) {
		const parts = [accountLabel(passkey), passkey.used ? t('settings-passkeys-last-used', { when: ago(passkey.used) }) : t('settings-passkeys-never-used')];
		if (current?.protection === 'chip' && !passkey.chip) parts.push(t('settings-passkeys-password-only'));
		return parts.filter(Boolean).join(' · ');
	}

	async function remove(passkey: Passkey) {
		removing = null;
		problem = '';
		try {
			await deletePasskey(passkey.id);
		} catch (reason) {
			problem = errorText(reason);
		}
		await load();
	}

	void load();
</script>

{#if current}
	<Section title={t('settings-passkeys-title')} description={protection(current)}>
		{#if !current.ready && current.protection !== 'unavailable'}
			<Row title={t('settings-passkeys-unreachable')} description={t('settings-passkeys-unreachable-description')} />
		{/if}
		{#each sorted as passkey (passkey.id)}
			<Row title={siteLabel(passkey)} description={details(passkey)} icon={KeyRound} truncate>
				<IconButton icon={Pencil} label={t('settings-passkeys-rename-label', { site: siteLabel(passkey) })} onclick={() => (renaming = passkey)} />
				<IconButton icon={Trash} label={t('settings-passkeys-remove-label', { site: siteLabel(passkey) })} onclick={() => (removing = passkey)} />
			</Row>
		{:else}
			{#if current.protection !== 'unavailable'}
				<Row title={t('settings-passkeys-empty')} description={t('settings-passkeys-empty-description')} />
			{/if}
		{/each}
	</Section>

	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
{/if}

{#if renaming}
	<RenameDialog passkey={renaming} onclose={() => (renaming = null)} />
{/if}

{#if removing}
	{@const passkey = removing}
	<Dialog
		title={t('settings-passkeys-remove-title')}
		description={t('settings-passkeys-remove-description', { site: siteLabel(passkey) })}
		onclose={() => (removing = null)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>{t('settings-protection-cancel')}</button>
			<button type="button" class="button danger" onclick={() => remove(passkey)}>{t('settings-protection-remove')}</button>
		{/snippet}
	</Dialog>
{/if}
