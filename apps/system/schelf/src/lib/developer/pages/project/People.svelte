<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { channelName } from '#lib/account/channels.js';
	import Loaded from '../../components/Loaded.svelte';
	import { act } from '../../state/act';
	import { reads } from '../../state/reads';
	import type { Project } from '../../store';
	import InviteDialog from './InviteDialog.svelte';
	import { day } from '../../format';

	type Taking = { channel: string; entry: string; name: string; token: boolean };

	let { project }: { project: Project } = $props();

	const id = $derived(project.app.id);
	const channels = $derived(project.channels.filter((channel) => channel.invite_only).map((channel) => channel.name));
	let inviting = $state<string | null>(null);
	let taking = $state<Taking | null>(null);

	$effect(() => {
		const watching = channels.map((channel) => reads.people(id, channel).watch());
		return () => watching.forEach((stop) => stop());
	});

	async function take({ channel, entry, name, token }: Taking) {
		const request = { id, channel, entry };
		const access = await act(
			token ? commands.developerRevokeDownloadToken(request) : commands.developerUninvite(request),
			t(token ? 'developer-people-revoked' : 'developer-people-removed', { name })
		);
		if (!access) return false;
		reads.people(id, channel).set(access);
	}
</script>

{#each channels as channel (channel)}
	<Loaded resource={reads.people(id, channel)}>
		{#snippet children(access)}
			{@const tokens = access.tokens.filter((token) => !token.revoked_at)}
			<Section title={channelName(channel)}>
				{#each access.invites as invite (invite.id)}
					<Row title={invite.email} description={t('developer-people-invited-by', { by: invite.invited_by, date: day(invite.created_at) })} truncate>
						<button type="button" class="button" onclick={() => (taking = { channel, entry: invite.id, name: invite.email, token: false })}>{t('developer-people-remove')}</button>
					</Row>
				{:else}
					<Row title={t('developer-people-nobody')} />
				{/each}
				<Row title={t('developer-invite-someone')}>
					<button type="button" class="button" onclick={() => (inviting = channel)}>{t('developer-invite')}</button>
				</Row>
			</Section>
			{#if tokens.length}
				<Section title={t('developer-people-tokens')}>
					{#each tokens as token (token.id)}
						<Row title={token.name} description={token.last_used_at ? t('developer-people-last-used', { date: day(token.last_used_at) }) : t('developer-people-not-used')}>
							<button type="button" class="button" onclick={() => (taking = { channel, entry: token.id, name: token.name, token: true })}>{t('developer-people-revoke')}</button>
						</Row>
					{/each}
				</Section>
			{/if}
		{/snippet}
	</Loaded>
{/each}

{#if inviting}
	<InviteDialog {project} channel={inviting} onclose={() => (inviting = null)} />
{/if}

{#if taking}
	{@const shown = taking}
	<ConfirmDialog
		title={t(shown.token ? 'developer-people-revoke-title' : 'developer-people-remove-title', { name: shown.name })}
		description={t(shown.token ? 'developer-people-revoke-description' : 'developer-people-remove-description')}
		action={t(shown.token ? 'developer-people-revoke' : 'developer-people-remove')}
		danger
		run={() => take(shown)}
		onclose={() => (taking = null)}
	/>
{/if}
