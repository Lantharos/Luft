<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Plus from '@lucide/svelte/icons/plus';
	import Terminal from '@lucide/svelte/icons/terminal';
	import Trash from '@lucide/svelte/icons/trash';
	import { IconButton, Row, Section, Switch } from '@luft/ui';
	import { ago } from '$lib/panels/updates/time';
	import { problem, publicKey, removeKey, setConfirm, type Ssh, type SshKey } from '../api';
	import AddKeyDialog from './AddKeyDialog.svelte';
	import ConfirmDialog from '../ConfirmDialog.svelte';
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

	const label = (key: SshKey) => key.name || 'Unnamed key';
	const details = (key: SshKey) => [kind(key.kind), key.chip && 'Kept in the security chip', `Added ${ago(key.added)}`].filter(Boolean).join(' · ');

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

<Section title="SSH keys" description="Keys for signing in to servers, kept safe in your keyring.">
	{#each sorted as key (key.fingerprint)}
		<Row title={label(key)} description={details(key)} icon={KeyRound} truncate>
			<IconButton
				icon={copied === key.fingerprint ? Check : Copy}
				label="Copy the public key of {label(key)}"
				onclick={() => copy(key.fingerprint, () => publicKey(key.fingerprint))}
			/>
			<IconButton icon={Trash} label="Remove {label(key)}" onclick={() => (removing = key)} />
			{#snippet below()}
				<div class="flex items-center gap-3 pl-[34px]">
					<span class="flex-1 text-[13px] text-[var(--text-soft)]">Ask before each use</span>
					<Switch
						label="Ask before each use of {label(key)}"
						checked={key.confirm}
						disabled={runner.busy}
						onchange={(confirm) => runner.run(() => setConfirm(key.fingerprint, confirm))}
					/>
				</div>
			{/snippet}
		</Row>
	{/each}
	<Row title="Add a key" icon={Plus} onclick={() => (adding = true)} />
	{#if ssh.socket}
		<Row title="Use these keys with SSH" description="Copy the line that points SSH at them" icon={Terminal}>
			<IconButton icon={copied === 'socket' ? Check : Copy} label="Copy {environment}" onclick={() => copy('socket', async () => `export ${environment}`)} />
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
		title="Remove “{label(key)}”?"
		description={key.chip
			? 'It only exists in this computer’s security chip, so it’s gone for good. Servers that only accept this key won’t let you in with it anymore.'
			: 'Servers that only accept this key won’t let you in with it anymore. This can’t be undone.'}
		action="Remove"
		run={() => remove(key)}
		onclose={() => (removing = null)}
	/>
{/if}
