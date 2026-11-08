<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { RemoteLogin, User } from '#lib/bindings.js';
	import type { RemoteLoginState } from './state.svelte';

	interface Props {
		remote: RemoteLoginState;
		current: RemoteLogin;
		run: (change: () => Promise<unknown>) => Promise<void>;
	}

	let { remote, current, run }: Props = $props();

	const WAIT_FOR_PERSON = { timeoutMs: 300_000 };

	const allowed = (person: User) => current.accounts.includes(person.userName);
	const named = (person: User) => person.realName || person.userName;

	const change = (person: User, on: boolean) =>
		run(() => commands.remoteLoginSetAccount({ account: person.userName, allowed: on }, on ? WAIT_FOR_PERSON : undefined));
</script>

<Section title={t('settings-remote-login-accounts')} description={t('settings-remote-login-accounts.description')}>
	{#each remote.people as person (person.userName)}
		<Row title={named(person)} description={person.userName}>
			<Switch label={t('settings-remote-login-account-label', { account: named(person) })} checked={allowed(person)} onchange={(on) => change(person, on)} />
		</Row>
	{/each}
</Section>
