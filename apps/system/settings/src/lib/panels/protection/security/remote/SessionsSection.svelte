<script lang="ts">
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import { t } from '@luft/i18n';
	import { ago, ConfirmDialog, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { SshSession } from '#lib/bindings.js';
	import type { RemoteLoginState } from './state.svelte';

	let { remote }: { remote: RemoteLoginState } = $props();

	let disconnecting = $state<SshSession | null>(null);

	const WAIT_FOR_PERSON = { timeoutMs: 300_000 };

	async function disconnect(session: SshSession) {
		await commands.remoteLoginDisconnect({ id: session.id }, WAIT_FOR_PERSON);
		await remote.refreshSessions();
	}
</script>

{#if remote.sessions.length}
	<Section title={t('settings-remote-login-sessions')}>
		{#each remote.sessions as session (session.id)}
			<Row
				title={t('settings-remote-login-session', { account: session.account, address: session.address })}
				description={t('settings-remote-login-session-since', { when: ago(session.since) })}
				icon={MonitorSmartphone}
			>
				<button type="button" class="button" onclick={() => (disconnecting = session)}>{t('settings-remote-login-disconnect')}</button>
			</Row>
		{/each}
	</Section>
{/if}

{#if disconnecting}
	{@const session = disconnecting}
	<ConfirmDialog
		title={t('settings-remote-login-disconnect-title', { account: session.account, address: session.address })}
		description={t('settings-remote-login-disconnect-description')}
		action={t('settings-remote-login-disconnect')}
		danger
		run={() => disconnect(session)}
		onclose={() => (disconnecting = null)}
	/>
{/if}
