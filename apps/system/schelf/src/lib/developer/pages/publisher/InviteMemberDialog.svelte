<script lang="ts">
	import { Dialog, Segmented, TextField } from '@luft/ui';
	import type { Invitee, Role } from '#lib/bindings.js';
	import { approvals } from '../../state/approval.svelte';
	import type { DashboardPublisher } from '../../store';
	import { ROLES } from './roles';

	const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const GITHUB = /^@?[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

	let { publisher, onclose, onsettled }: { publisher: DashboardPublisher; onclose: () => void; onsettled: () => void } = $props();

	let who = $state('');
	let role = $state<Role>('developer');

	let field = $state<ReturnType<typeof TextField>>();

	$effect(() => {
		const frame = requestAnimationFrame(() => field?.focus());
		return () => cancelAnimationFrame(frame);
	});

	const to = $derived.by((): Invitee | null => {
		const text = who.trim();
		if (EMAIL.test(text)) return { email: text.toLowerCase() };
		if (GITHUB.test(text)) return { github: text.replace(/^@/, '') };
		return null;
	});

	function invite() {
		if (!to) return;
		const action = { type: 'member.invite' as const, publisher: publisher.id, to, role };
		const settled = onsettled;
		onclose();
		void approvals.ask(`Invite ${who.trim()}`, [action], settled);
	}
</script>

<Dialog title="Invite to {publisher.name}" {onclose}>
	<TextField bind:this={field} bind:value={who} label="Email or GitHub username" placeholder="name@example.com or @username" onkeydown={(event) => event.key === 'Enter' && invite()} />
	<Segmented
		label="Role"
		value={role}
		options={(['developer', 'admin'] as const).map((value) => ({ value, label: ROLES[value] }))}
		onchange={(value) => (role = value)}
	/>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!to} onclick={invite}>Invite</button>
	{/snippet}
</Dialog>
