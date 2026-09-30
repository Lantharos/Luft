<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import { Avatar, Dialog, ItemRow, Row, Section, TextField } from '@luft/ui';
	import FingerprintSection from './FingerprintSection.svelte';
	import PasswordDialog from './PasswordDialog.svelte';
	import { accountType, choosePicture, displayName, rename, users, type Users } from './api';

	let accounts = $state<Users | null>(null);
	let version = $state(0);
	let problem = $state('');
	let renaming = $state(false);
	let changingPassword = $state(false);
	let draft = $state('');
	let renameError = $state('');

	async function load() {
		accounts = await users();
		version += 1;
	}

	async function attempt(change: () => Promise<unknown>) {
		problem = '';
		try {
			await change();
		} catch (reason) {
			problem = String(reason);
		}
		await load();
	}

	function startRename() {
		draft = accounts?.me.realName ?? '';
		renameError = '';
		renaming = true;
	}

	async function saveName() {
		try {
			await rename(draft);
			renaming = false;
			await load();
		} catch (reason) {
			renameError = String(reason);
		}
	}

	void load();
</script>

{#if accounts}
	{@const me = accounts.me}
	<div class="flex items-center gap-5 px-2 pb-2">
		<button type="button" class="picture" aria-label="Change your picture" title="Change your picture" onclick={() => attempt(choosePicture)}>
			<Avatar picture={me.picture} name={displayName(me)} size={76} {version} />
			<span class="overlay">Edit</span>
			<span class="puck"><Camera size={13} /></span>
		</button>
		<div class="flex min-w-0 flex-col gap-1">
			<span class="truncate text-[26px] font-semibold">{displayName(me)}</span>
			<span class="text-[14px] text-[var(--text-muted)]">{me.userName}</span>
		</div>
	</div>

	<Section title="Your account">
		<Row title="Name" description="Shown when you sign in and on the lock screen">
			<span class="max-w-[220px] truncate">{me.realName}</span>
			<button type="button" class="button" onclick={startRename}>Change</button>
		</Row>
		<Row title="Password" description={me.hasPassword ? 'Used to sign in and unlock this computer' : 'No password is set'}>
			<button type="button" class="button" onclick={() => (changingPassword = true)}>{me.hasPassword ? 'Change' : 'Set password'}</button>
		</Row>
		<Row title="Account type"><span>{accountType(me)}</span></Row>
	</Section>

	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<FingerprintSection />

	{#if accounts.others.length}
		<Section title="Other people on this computer">
			{#each accounts.others as user (user.userName)}
				<ItemRow title={displayName(user)} description={accountType(user)}>
					{#snippet leading()}
						<Avatar picture={user.picture} name={displayName(user)} size={36} {version} />
					{/snippet}
				</ItemRow>
			{/each}
		</Section>
	{/if}
{/if}

{#if renaming}
	<Dialog title="Change your name" description="This is how you appear when you sign in." onclose={() => (renaming = false)}>
		<TextField label="Name" bind:value={draft} error={renameError} live onkeydown={(event) => event.key === 'Enter' && draft.trim() && saveName()} />
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (renaming = false)}>Cancel</button>
			<button type="button" class="button primary" disabled={!draft.trim()} onclick={saveName}>Save</button>
		{/snippet}
	</Dialog>
{/if}

{#if changingPassword && accounts}
	<PasswordDialog user={accounts.me} onclose={() => ((changingPassword = false), void load())} />
{/if}

<style>
	.picture {
		position: relative;
		flex: none;
		border-radius: var(--radius-pill);
		transition: transform 180ms var(--ease);
	}

	.picture:hover {
		transform: scale(1.03);
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border-radius: var(--radius-pill);
		background: rgba(8, 8, 7, 0.5);
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		opacity: 0;
		transition: opacity 180ms var(--ease);
	}

	.puck {
		position: absolute;
		right: -2px;
		bottom: -2px;
		display: grid;
		height: 26px;
		width: 26px;
		place-items: center;
		border: 3px solid var(--content);
		border-radius: var(--radius-pill);
		background: var(--control-hover);
		color: var(--text);
		transition: background-color 180ms var(--ease), color 180ms var(--ease);
	}

	.picture:hover .overlay,
	.picture:focus-visible .overlay {
		opacity: 1;
	}

	.picture:hover .puck,
	.picture:focus-visible .puck {
		background: var(--accent);
		color: var(--accent-text);
	}
</style>
