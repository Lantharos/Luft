<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import Loaded from '../../components/Loaded.svelte';
	import { liveOn } from '../../format';
	import type { Resource } from '../../state/resource.svelte';
	import type { Channel, Project, Releases, ReleaseSummary } from '../../store';
	import Rollout from '../release/Rollout.svelte';

	let { project, releases }: { project: Project; releases: Resource<Releases> } = $props();

	function facts(channel: Channel) {
		return [
			channel.gradual ? 'Reaches people step by step' : 'Reaches everyone at once',
			channel.keep ? `keeps the last ${channel.keep}` : null,
			channel.ended_into ? `ended into ${channelName(channel.ended_into)}` : null
		]
			.filter(Boolean)
			.join(', ');
	}

	function show(release: ReleaseSummary) {
		navigation.push({ page: 'release', id: project.app.id, release: release.id, version: release.version });
	}
</script>

<Loaded resource={releases}>
	{#snippet children(list)}
		{#each project.channels as channel (channel.name)}
			{@const live = liveOn(list, channel.name)}
			<Section title={channelName(channel.name)}>
				<Row title={live ? live.version : 'Nothing yet'} description={facts(channel)} onclick={live ? () => show(live) : undefined}>
					{#if channel.invite_only}
						<span>Invite only</span>
					{/if}
				</Row>
				{#if live?.status === 'rolling-out'}
					<Rollout id={project.app.id} release={live} />
				{/if}
				{#if channel.invite_only}
					<Row title="People">
						<button type="button" class="button" onclick={() => navigation.open({ page: 'project', id: project.app.id, tab: 'people' })}>Show</button>
					</Row>
				{/if}
			</Section>
		{/each}
		<p class="-mt-3 px-2 text-[13px] text-[var(--text-muted)]">Channels are set under [channels] in schelf.toml.</p>
	{/snippet}
</Loaded>
