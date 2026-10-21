<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Plus from '@lucide/svelte/icons/plus';
	import Terminal from '@lucide/svelte/icons/terminal';
	import Trash from '@lucide/svelte/icons/trash';
	import { t } from '@luft/i18n';
	import { ago, ConfirmDialog, IconButton, Row, Section, Switch } from '@luft/ui';
	import { problem, publicKey, removeKey, setConfirm, type Ssh, type SshKey } from '../api';
	import AddKeyDialog from './AddKeyDialog.svelte';
	import { kind } from '../describe';
	import { Runner } from '../runner.svelte';

	const COPIED_FOR = 2000;

	let { ssh, refresh }: { ssh: Ssh; refresh: () => Promise<void> } = $props();

	const runner = new Runner(() => refresh());

	let adding = $state(false);
	let removing = $state<SshKey | null>(null);
	let copied = $state('');

	let sorted = $derived([...ssh.keys].sort((a, b) => b.added - a.added));
	let environment = $derived(`SSH_AUTH_SOCK=${ssh.socket}`);

	const label = (key: SshKey) => key.name || t('settings-passwords-ssh-unnamed');
	const details = (key: SshKey) =>
		[kind(key.kind), key.chip && t('settings-passwords-ssh-in-chip'), t('settings-passwords-ssh-added', { when: ago(key.added) })].filter(Boolean).join(' · ');

	async function copy(id: string, text: () => Promise<string>) {
		runner.error = '';
		try {
			await navigator.clipboard.writeText(await text());
		} catch (reason) {
			runner.error = problem(reason);
			return;
		}
		copied = id;
		setTimeout(() => {
			if (copied === id) copied = '';
		}, COPIED_FOR);
	}

	async function remove(key: SshKey) {
		await removeKey(key.fingerprint);
		await refresh();
	}
</script>

<Section title={t('settings-passwords-ssh')} description={t('settings-passwords-ssh-description')}>
	{#each sorted as key (key.fingerprint)}
		<Row title={label(key)} description={details(key)} icon={KeyRound} truncate>
			<IconButton
				icon={copied === key.fingerprint ? Check : Copy}
				label={t('settings-passwords-ssh-copy', { name: label(key) })}
				onclick={() => copy(key.fingerprint, () => publicKey(key.fingerprint))}
			/>
			<IconButton icon={Trash} label={t('settings-passwords-ssh-remove', { name: label(key) })} onclick={() => (removing = key)} />
			{#snippet below()}
				<div class="flex items-center gap-3 pl-[34px]">
					<span class="flex-1 text-[13px] text-[var(--text-soft)]">{t('settings-passwords-ssh-confirm')}</span>
					<Switch
						label={t('settings-passwords-ssh-confirm-label', { name: label(key) })}
						checked={key.confirm}
						disabled={runner.busy}
						onchange={(confirm) => runner.run(() => setConfirm(key.fingerprint, confirm))}
					/>
				</div>
			{/snippet}
		</Row>
	{/each}
	<Row title={t('settings-passwords-ssh-add-row')} icon={Plus} onclick={() => (adding = true)} />
	{#if ssh.socket}
		<Row title={t('settings-passwords-ssh-use')} description={t('settings-passwords-ssh-use-description')} icon={Terminal}>
			<IconButton icon={copied === 'socket' ? Check : Copy} label={t('settings-passwords-ssh-copy-line', { line: environment })} onclick={() => copy('socket', async () => `export ${environment}`)} />
		</Row>
	{/if}
</Section>

{#if runner.error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{runner.error}</p>
{/if}

{#if adding}
	<AddKeyDialog chipKeys={ssh.chipKeys} {refresh} onclose={() => (adding = false)} />
{/if}

{#if removing}
	{@const key = removing}
	<ConfirmDialog
		title={t('settings-passwords-ssh-remove-title', { name: label(key) })}
		description={key.chip ? t('settings-passwords-ssh-remove-chip') : t('settings-passwords-ssh-remove-description')}
		action={t('settings-protection-remove')}
		danger
		run={() => remove(key)}
		onclose={() => (removing = null)}
	/>
{/if}
