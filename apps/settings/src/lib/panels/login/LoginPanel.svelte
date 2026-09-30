<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Avatar, ItemRow, Row, Section, Select, Switch } from '@luft/ui';
	import { displayName, users, type User } from '../users/api';
	import {
		chooseWallpaper,
		clearWallpaper,
		loginScreen,
		onLoginScreenChanged,
		setAutomaticLogin,
		setDefaultSession,
		setHiddenUsers,
		setShowUsers,
		type LoginScreen
	} from './api';
	import WallpaperSection from './WallpaperSection.svelte';

	type Area = 'wallpaper' | 'people' | 'signing-in';

	let screen = $state<LoginScreen | null | undefined>();
	let people = $state<User[]>([]);
	let version = $state(0);
	let problem = $state<{ area: Area; message: string } | null>(null);

	let sessions = $derived([
		{ value: '', label: 'Automatic' },
		...(screen?.sessions ?? []).map((session) => ({ value: session.id, label: session.x11 ? `${session.name} (X11)` : session.name }))
	]);
	let automaticLogins = $derived([{ value: '', label: 'Off' }, ...people.map((user) => ({ value: user.userName, label: displayName(user) }))]);

	function receive(next: LoginScreen | null) {
		screen = next;
		version += 1;
	}

	async function attempt(area: Area, change: () => Promise<unknown>) {
		problem = null;
		try {
			await change();
		} catch (reason) {
			problem = { area, message: String(reason) };
		}
		receive(await loginScreen());
	}

	function showPerson(hidden: string[], userName: string, shown: boolean) {
		return setHiddenUsers(shown ? hidden.filter((name) => name !== userName) : [...hidden, userName]);
	}

	void loginScreen().then(receive);
	void users().then((accounts) => (people = [accounts.me, ...accounts.others]));
	onDestroy(onLoginScreenChanged(receive));
</script>

{#snippet trouble(area: Area)}
	{#if problem?.area === area}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem.message}</p>
	{/if}
{/snippet}

{#if screen === null}
	<p class="px-2 text-[14px] text-[var(--text-muted)]">The login screen can't be changed on this computer.</p>
{:else if screen}
	{@const hidden = screen.hiddenUsers}
	<WallpaperSection
		wallpaper={screen.sharedWallpaper}
		{version}
		onchoose={() => attempt('wallpaper', chooseWallpaper)}
		onclear={() => attempt('wallpaper', clearWallpaper)}
	/>
	{@render trouble('wallpaper')}

	<Section title="People">
		<Row title="Show people on the login screen" description={screen.showUsers ? 'Choose an account from a list to sign in' : 'Everyone types their username to sign in'}>
			<Switch label="Show people on the login screen" checked={screen.showUsers} onchange={(on) => attempt('people', () => setShowUsers(on))} />
		</Row>
		{#if screen.showUsers}
			{#each people as user (user.userName)}
				{@const shown = !hidden.includes(user.userName)}
				<ItemRow title={displayName(user)} description={shown ? user.userName : 'Types their username to sign in'}>
					{#snippet leading()}
						<Avatar picture={user.picture} name={displayName(user)} size={36} />
					{/snippet}
					<Switch label="Show {displayName(user)}" checked={shown} onchange={(on) => attempt('people', () => showPerson(hidden, user.userName, on))} />
				</ItemRow>
			{/each}
		{/if}
	</Section>
	{@render trouble('people')}

	<Section title="Signing in">
		{#if screen.sessions.length > 1}
			<Row title="Default session" description="Starts when someone signs in, unless they've picked another">
				<Select label="Default session" options={sessions} value={screen.defaultSession} onchange={(session) => attempt('signing-in', () => setDefaultSession(session))} />
			</Row>
		{/if}
		<Row title="Automatic login" description="Sign in without a password when this computer starts">
			<Select label="Automatic login" options={automaticLogins} value={screen.automaticLogin} onchange={(user) => attempt('signing-in', () => setAutomaticLogin(user))} />
		</Row>
	</Section>
	{@render trouble('signing-in')}
{/if}
