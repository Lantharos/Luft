<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
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
	import { ROLES } from './roles';

	let { publisher }: { publisher: DashboardPublisher } = $props();

	const members = $derived(reads.members(publisher.id));
	const manages = $derived(publisher.role !== 'developer');
	let inviting = $state(false);
	let revoking = $state<SentInvite | null>(null);

	$effect(() => members.watch());

	const settled = () => developer.resources.expire(`members:${publisher.id}`);
	const invitee = (invite: SentInvite) => invite.email ?? `@${invite.github}`;

	function role(member: Member, next: Role) {
		void approvals.ask(`Make ${member.name} ${ROLES[next].toLowerCase()}`, [{ type: 'member.role', publisher: publisher.id, user: member.user_id, role: next }], settled);
	}

	function remove(member: Member) {
		void approvals.ask(`Remove ${member.name}`, [{ type: 'member.remove', publisher: publisher.id, user: member.user_id }], settled);
	}

	async function revoke(invite: SentInvite) {
		const left = await act(commands.developerRevokeMemberInvite({ publisher: publisher.id, invite: invite.id }), `Took back ${invitee(invite)}'s invitation`);
		if (!left) return false;
		members.set(left);
	}
</script>

<Loaded resource={members}>
	{#snippet children(list)}
		<Section>
			{#each list.members as member (member.user_id)}
				<Row title={member.name} description="{member.email} · since {day(member.joined_at)}" truncate>
					<span>{ROLES[member.role]}</span>
					{#if manages && member.role !== 'owner'}
						<MenuButton label="More for {member.name}" class="icon-button" align="end">
							{#snippet trigger()}<Ellipsis size={18} />{/snippet}
							{#snippet children(close)}
								{#each (['admin', 'developer'] as const).filter((next) => next !== member.role) as next (next)}
									<MenuItem onclick={() => (close(), role(member, next))}>Make {ROLES[next].toLowerCase()}</MenuItem>
								{/each}
								<MenuItem danger onclick={() => (close(), remove(member))}>Remove</MenuItem>
							{/snippet}
						</MenuButton>
					{/if}
				</Row>
			{/each}
			{#if manages}
				<Row title="Invite someone">
					<button type="button" class="button" onclick={() => (inviting = true)}>Invite</button>
				</Row>
			{/if}
		</Section>
		{#if list.invites.length}
			<Section title="Invited">
				{#each list.invites as invite (invite.id)}
					<Row title={invitee(invite)} description="{ROLES[invite.role]}, until {day(invite.expires_at)}{invite.invited_by ? `, from ${invite.invited_by}` : ''}">
						{#if manages}
							<button type="button" class="button" onclick={() => (revoking = invite)}>Take back</button>
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
	<ConfirmDialog title="Take back {invitee(invite)}'s invitation?" description="The link in their email stops working." action="Take back" danger run={() => revoke(invite)} onclose={() => (revoking = null)} />
{/if}
