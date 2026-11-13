<script lang="ts">
	import { Dialog, TextField } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import { approvals } from '../../state/approval.svelte';
	import { changed } from '../../state/reads';
	import type { Project } from '../../store';

	const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let { project, channel, onclose }: { project: Project; channel: string; onclose: () => void } = $props();

	let email = $state('');
	const valid = $derived(EMAIL.test(email.trim()));

	let field = $state<ReturnType<typeof TextField>>();

	$effect(() => {
		const frame = requestAnimationFrame(() => field?.focus());
		return () => cancelAnimationFrame(frame);
	});

	function invite() {
		if (!valid) return;
		const action = { type: 'channel.invite' as const, app: project.app.id, channel, email: email.trim().toLowerCase() };
		onclose();
		void approvals.ask(`Invite ${action.email}`, [action], () => changed(action.app));
	}
</script>

<Dialog title="Invite to {channelName(channel)}" description="schelf.store emails them, and you approve it in your browser first." {onclose}>
	<TextField bind:this={field} bind:value={email} label="Email" placeholder="name@example.com" onkeydown={(event) => event.key === 'Enter' && invite()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid} onclick={invite}>Invite</button>
	{/snippet}
</Dialog>
