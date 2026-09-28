<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import { Avatar, Dialog, ItemRow, Row, Section, Switch } from '@luft/ui';
	import { accountType, choosePicture, displayName, rename, setAutomaticLogin, users, type Users } from './api';

	let accounts = $state<Users | null>(null);
	let version = $state(0);
	let problem = $state('');
	let renaming = $state(false);
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
		<button type="button" class="picture" aria-label="Change your picture" onclick={() => attempt(choosePicture)}>
			<Avatar picture={me.picture} name={displayName(me)} size={76} {version} />
			<span class="overlay"><Camera size={22} /></span>
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
		<Row title="Picture">
			<button type="button" class="button" onclick={() => attempt(choosePicture)}>Choose picture</button>
		</Row>
		<Row title="Account type"><span>{accountType(me)}</span></Row>
		<Row title="Automatic login" description="Sign in without a password when this computer starts">
			<Switch label="Automatic login" checked={me.automaticLogin} onchange={(on) => attempt(() => setAutomaticLogin(on))} />
		</Row>
	</Section>

	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

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
		<input class="text-field" aria-label="Name" bind:value={draft} onkeydown={(event) => event.key === 'Enter' && draft.trim() && saveName()} />
		{#if renameError}
			<p class="text-[13px] text-[var(--danger)]">{renameError}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (renaming = false)}>Cancel</button>
			<button type="button" class="button primary" disabled={!draft.trim()} onclick={saveName}>Save</button>
		{/snippet}
	</Dialog>
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
		background: rgba(8, 8, 7, 0.45);
		color: #f3f3ef;
		opacity: 0;
		transition: opacity 180ms var(--ease);
	}

	.picture:hover .overlay,
	.picture:focus-visible .overlay {
		opacity: 1;
	}
</style>
