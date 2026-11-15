<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { t } from '@luft/i18n';
	import { ConfirmDialog, MenuButton, MenuItem, Row, Section } from '@luft/ui';
	import { commands, type Role } from '#lib/bindings.js';
	import Loaded from '../../components/Loaded.svelte';
	import { day } from '../../format';
	import { act } from '../../state/act';
	import { approvals } from '../../state/approval.svelte';
	import { developer } from '../../state/developer.svelte';
	import { reads } from '../../state/reads';
	import type { DashboardPublisher, Member, SentInvite } from '../../store';
	import InviteMemberDialog from './InviteMemberDialog.svelte';
	import { roleName } from './roles';

	let { publisher }: { publisher: DashboardPublisher } = $props();

	const members = $derived(reads.members(publisher.id));
	const manages = $derived(publisher.role !== 'developer');
	let inviting = $state(false);
	let revoking = $state<SentInvite | null>(null);

	$effect(() => members.watch());

	const settled = () => developer.resources.expire(`members:${publisher.id}`);
	const invitee = (invite: SentInvite) => invite.email ?? `@${invite.github}`;

	function role(member: Member, next: Role) {
		void approvals.ask(t('developer-members-make-approval', { name: member.name, role: next }), [{ type: 'member.role', publisher: publisher.id, user: member.user_id, role: next }], settled);
	}

	function remove(member: Member) {
		void approvals.ask(t('developer-members-remove-approval', { name: member.name }), [{ type: 'member.remove', publisher: publisher.id, user: member.user_id }], settled);
	}

	async function revoke(invite: SentInvite) {
		const left = await act(commands.developerRevokeMemberInvite({ publisher: publisher.id, invite: invite.id }), t('developer-members-taken-back', { who: invitee(invite) }));
		if (!left) return false;
		members.set(left);
	}
</script>

<Loaded resource={members}>
	{#snippet children(list)}
		<Section>
			{#each list.members as member (member.user_id)}
				<Row title={member.name} description={t('developer-members-since', { email: member.email, date: day(member.joined_at) })} truncate>
					<span>{roleName(member.role)}</span>
					{#if manages && member.role !== 'owner'}
						<MenuButton label={t('developer-members-more', { name: member.name })} class="icon-button" align="end">
							{#snippet trigger()}<Ellipsis size={18} />{/snippet}
							{#snippet children(close)}
								{#each (['admin', 'developer'] as const).filter((next) => next !== member.role) as next (next)}
									<MenuItem onclick={() => (close(), role(member, next))}>{t('developer-members-make', { role: next })}</MenuItem>
								{/each}
								<MenuItem danger onclick={() => (close(), remove(member))}>{t('developer-members-remove')}</MenuItem>
							{/snippet}
						</MenuButton>
					{/if}
				</Row>
			{/each}
			{#if manages}
				<Row title={t('developer-invite-someone')}>
					<button type="button" class="button" onclick={() => (inviting = true)}>{t('developer-invite')}</button>
				</Row>
			{/if}
		</Section>
		{#if list.invites.length}
			<Section title={t('developer-members-invited')}>
				{#each list.invites as invite (invite.id)}
					<Row
						title={invitee(invite)}
						description={invite.invited_by
							? t('developer-members-invite-facts-by', { role: roleName(invite.role), date: day(invite.expires_at), by: invite.invited_by })
							: t('developer-members-invite-facts', { role: roleName(invite.role), date: day(invite.expires_at) })}
					>
						{#if manages}
							<button type="button" class="button" onclick={() => (revoking = invite)}>{t('developer-members-take-back')}</button>
						{/if}
					</Row>
				{/each}
			</Section>
		{/if}
	{/snippet}
</Loaded>

{#if inviting}
	<InviteMemberDialog {publisher} onclose={() => (inviting = false)} onsettled={settled} />
{/if}

{#if revoking}
	{@const invite = revoking}
	<ConfirmDialog
		title={t('developer-members-take-back-title', { who: invitee(invite) })}
		description={t('developer-members-take-back-description')}
		action={t('developer-members-take-back')}
		danger
		run={() => revoke(invite)}
		onclose={() => (revoking = null)}
	/>
{/if}
