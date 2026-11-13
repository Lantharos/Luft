<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, Select } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { channelName } from '#lib/account/channels.js';
	import { act } from '../../state/act';
	import { changed } from '../../state/reads';
	import type { Release } from '../../store';

	let { id, release, channels, onclose }: { id: string; release: Release; channels: string[]; onclose: () => void } = $props();

	let channel = $state(untrack(() => channels[0]));
	let busy = $state(false);

	async function promote() {
		busy = true;
		const promoted = await act(commands.developerPromote({ id, release: release.id, channel }), `${release.version} is on ${channelName(channel)} too`);
		busy = false;
		if (!promoted) return;
		changed(id);
		onclose();
	}
</script>

<Dialog title="Offer {release.version} on another channel" {onclose}>
	<Select label="Channel" options={channels.map((value) => ({ value, label: channelName(value) }))} value={channel} onchange={(value) => (channel = value)} />
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={busy} onclick={promote}>Offer it</button>
	{/snippet}
</Dialog>
