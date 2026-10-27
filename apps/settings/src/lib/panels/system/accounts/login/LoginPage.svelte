<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import { Avatar, ItemRow, Row, Section, Select, Switch } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { LoginScreen, User } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { displayName } from '../users/api';
	import { chooseWallpaper, clearWallpaper, setAutomaticLogin, setDefaultSession, setHiddenUsers, setShowUsers } from './api';
	import WallpaperSection from './WallpaperSection.svelte';

	type Area = 'wallpaper' | 'people' | 'signing-in';

	let { onclose }: { onclose: () => void } = $props();

	let screen = $state<LoginScreen | null | undefined>();
	let people = $state<User[]>([]);
	let version = $state(0);
	let problem = $state<{ area: Area; message: string } | null>(null);

	let sessions = $derived([
		{ value: '', label: t('settings-login-session-automatic') },
		...(screen?.sessions ?? []).map((session) => ({ value: session.id, label: session.name }))
	]);
	let automaticLogins = $derived([{ value: '', label: t('settings-login-automatic-off') }, ...people.map((user) => ({ value: user.userName, label: displayName(user) }))]);

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
		receive(await commands.loginScreen());
	}

	function showPerson(hidden: string[], userName: string, shown: boolean) {
		return setHiddenUsers(shown ? hidden.filter((name) => name !== userName) : [...hidden, userName]);
	}

	void commands.loginScreen().then(receive);
	void commands.users().then((accounts) => (people = [accounts.me, ...accounts.others]));
	onDestroy(events.loginChanged(receive));
</script>

{#snippet trouble(area: Area)}
	{#if problem?.area === area}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem.message}</p>
	{/if}
{/snippet}

<SubPage title={t('settings-page-login')} back={t('settings-page-accounts')} {onclose}>
	{#if screen === null}
		<p class="px-2 text-[14px] text-[var(--text-muted)]">{t('settings-login-unavailable')}</p>
	{:else if screen}
		{@const hidden = screen.hiddenUsers}
		<WallpaperSection
			wallpaper={screen.sharedWallpaper}
			{version}
			onchoose={() => attempt('wallpaper', chooseWallpaper)}
			onclear={() => attempt('wallpaper', clearWallpaper)}
		/>
		{@render trouble('wallpaper')}

		<Section title={t('settings-login-people')}>
			<Row title={t('settings-login-show-people')} description={screen.showUsers ? t('settings-login-show-people-on') : t('settings-login-show-people-off')}>
				<Switch label={t('settings-login-show-people')} checked={screen.showUsers} onchange={(on) => attempt('people', () => setShowUsers(on))} />
			</Row>
			{#if screen.showUsers}
				{#each people as user (user.userName)}
					{@const shown = !hidden.includes(user.userName)}
					<ItemRow title={displayName(user)} description={shown ? user.userName : t('settings-login-person-hidden')}>
						{#snippet leading()}
							<Avatar picture={user.picture} name={displayName(user)} size={36} />
						{/snippet}
						<Switch label={t('settings-login-show-person', { name: displayName(user) })} checked={shown} onchange={(on) => attempt('people', () => showPerson(hidden, user.userName, on))} />
					</ItemRow>
				{/each}
			{/if}
		</Section>
		{@render trouble('people')}

		<Section title={t('settings-login-signing-in')}>
			{#if screen.sessions.length > 1}
				<Row title={t('settings-login-session')} description={t('settings-login-session-description')}>
					<Select label={t('settings-login-session')} options={sessions} value={screen.defaultSession} onchange={(session) => attempt('signing-in', () => setDefaultSession(session))} />
				</Row>
			{/if}
			<Row title={t('settings-login-automatic')} description={t('settings-login-automatic-description')}>
				<Select label={t('settings-login-automatic')} options={automaticLogins} value={screen.automaticLogin} onchange={(user) => attempt('signing-in', () => setAutomaticLogin(user))} />
			</Row>
		</Section>
		{@render trouble('signing-in')}
	{/if}
</SubPage>
