<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Segmented, TextField } from '@luft/ui';
	import type { Invitee, Role } from '#lib/bindings.js';
	import { approvals } from '../../state/approval.svelte';
	import type { DashboardPublisher } from '../../store';
	import { roleName } from './roles';

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
		void approvals.ask(t('developer-members-invite-approval', { who: who.trim() }), [action], settled);
	}
</script>

<Dialog title={t('developer-members-invite-title', { publisher: publisher.name })} {onclose}>
	<TextField bind:this={field} bind:value={who} label={t('developer-members-who')} placeholder={t('developer-members-who-placeholder')} onkeydown={(event) => event.key === 'Enter' && invite()} />
	<Segmented
		label={t('developer-members-role')}
		value={role}
		options={(['developer', 'admin'] as const).map((value) => ({ value, label: roleName(value) }))}
		onchange={(value) => (role = value)}
	/>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('developer-cancel')}</button>
		<button type="button" class="button primary" disabled={!to} onclick={invite}>{t('developer-invite')}</button>
	{/snippet}
</Dialog>
