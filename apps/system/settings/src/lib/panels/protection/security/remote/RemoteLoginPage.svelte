<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import RectangleEllipsis from '@lucide/svelte/icons/rectangle-ellipsis';
	import TerminalSquare from '@lucide/svelte/icons/square-terminal';
	import { t } from '@luft/i18n';
	import { ConfirmDialog, errorText, Row, Section, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { RemoteLogin } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import AccountsSection from './AccountsSection.svelte';
	import ConnectSection from './ConnectSection.svelte';
	import { remoteLoginSummary } from './describe';
	import KeysSection from './KeysSection.svelte';
	import SessionsSection from './SessionsSection.svelte';
	import type { RemoteLoginState } from './state.svelte';

	type Warning = 'turn-on' | 'passwords' | 'public';

	interface Props {
		remote: RemoteLoginState;
		current: RemoteLogin;
		onclose: () => void;
	}

	let { remote, current, onclose }: Props = $props();

	let warning = $state<Warning | null>(null);
	let busy = $state(false);
	let error = $state('');

	const WAIT_FOR_PERSON = { timeoutMs: 300_000 };

	const WARNINGS: Record<Warning, { title: string; description: string; action: string; run: () => Promise<unknown> }> = {
		'turn-on': {
			title: 'settings-remote-login-turn-on-title',
			description: 'settings-remote-login-turn-on-description',
			action: 'settings-protection-turn-on',
			run: () => commands.remoteLoginSetEnabled({ on: true }, WAIT_FOR_PERSON)
		},
		passwords: {
			title: 'settings-remote-login-passwords-title',
			description: 'settings-remote-login-passwords-warning',
			action: 'settings-remote-login-passwords-allow',
			run: () => commands.remoteLoginSetPasswords({ on: true }, WAIT_FOR_PERSON)
		},
		public: {
			title: 'settings-remote-login-public-title',
			description: 'settings-remote-login-public-warning',
			action: 'settings-remote-login-public-allow',
			run: () => commands.remoteLoginSetPublic({ on: true }, WAIT_FOR_PERSON)
		}
	};

	async function run(change: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await change();
			await remote.refresh();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}

	function turn(on: boolean) {
		if (on) warning = 'turn-on';
		else void run(() => commands.remoteLoginSetEnabled({ on: false }));
	}

	async function warned(chosen: Warning) {
		await WARNINGS[chosen].run();
		await remote.refresh();
	}
</script>

<SubPage title={t('settings-page-remote-login')} {onclose}>
	<Section description={t('settings-remote-login.description')}>
		<Row title={t('settings-remote-login')} description={current.enabled ? remoteLoginSummary(current) : undefined} icon={TerminalSquare}>
			<Switch label={t('settings-remote-login')} checked={current.enabled} disabled={busy} onchange={turn} />
		</Row>
	</Section>

	{#if error}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
	{/if}

	{#if current.enabled}
		<ConnectSection {current} account={remote.me?.userName ?? ''} addresses={remote.addresses} />
		<KeysSection {remote} />
		<SessionsSection {remote} />
		<AccountsSection {remote} {current} {run} />

		<Section title={t('settings-remote-login-safety')}>
			<Row title={t('settings-remote-login-passwords')} description={t('settings-remote-login-passwords-description')} icon={RectangleEllipsis}>
				<Switch
					label={t('settings-remote-login-passwords')}
					checked={current.passwordLogin}
					disabled={busy}
					onchange={(on) => (on ? (warning = 'passwords') : run(() => commands.remoteLoginSetPasswords({ on: false })))}
				/>
			</Row>
			<Row title={t('settings-remote-login-public')} description={t('settings-remote-login-public-description')} icon={Globe}>
				<Switch
					label={t('settings-remote-login-public')}
					checked={current.publicNetworks}
					disabled={busy}
					onchange={(on) => (on ? (warning = 'public') : run(() => commands.remoteLoginSetPublic({ on: false })))}
				/>
			</Row>
		</Section>
	{/if}
</SubPage>

{#if warning}
	{@const chosen = warning}
	<ConfirmDialog
		title={t(WARNINGS[chosen].title)}
		description={t(WARNINGS[chosen].description)}
		action={t(WARNINGS[chosen].action)}
		danger={chosen !== 'turn-on'}
		run={() => warned(chosen)}
		onclose={() => (warning = null)}
	/>
{/if}
