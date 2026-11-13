<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import { openUrl } from '#lib/bridge/index.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import Status from '../../components/Status.svelte';
	import { count, day, liveOn, rolloutText } from '../../format';
	import type { Resource } from '../../state/resource.svelte';
	import type { Project, Releases, ReleaseSummary } from '../../store';

	let { project, releases }: { project: Project; releases: Resource<Releases> } = $props();

	const app = $derived(project.app);
	const list = $derived(releases.data ?? []);
	const latest = $derived(list[0] ?? null);
	const repository = $derived(app.repository);

	const PRIVACY = {
		telemetry: { none: 'No usage data', 'opt-in': 'Usage data if people turn it on', 'opt-out': 'Usage data unless people turn it off' },
		ai: { none: 'no AI features', 'on-device': 'AI on the computer', online: 'online AI features' }
	} as const;

	function show(release: ReleaseSummary) {
		navigation.push({ page: 'release', id: app.id, release: release.id, version: release.version });
	}
</script>

{#if latest}
	<Section title="Latest release">
		<Row title="{latest.version} on {channelName(latest.channel)}" description="Published {day(latest.created_at)}" onclick={() => show(latest)}>
			<Status status={latest.status} />
		</Row>
	</Section>
{/if}

<Section title="On each channel">
	{#each project.channels as channel (channel.name)}
		{@const live = liveOn(list, channel.name)}
		{#if live}
			<Row title={channelName(channel.name)} description="{live.version} · {rolloutText(live)}" onclick={() => show(live)}>
				{#if channel.invite_only}<span>Invite only</span>{/if}
			</Row>
		{:else}
			<Row title={channelName(channel.name)} description={channel.ended_into ? `Ended, its people moved to ${channelName(channel.ended_into)}` : 'Nothing reached anyone yet'} />
		{/if}
	{/each}
</Section>

<Section title="Project">
	<Row title="Installs this week"><span class="tabular-nums">{count(app.installs_7d)}</span></Row>
	<Row title="Page" description={project.links.page} truncate>
		<button type="button" class="button" onclick={() => openUrl(project.links.page)}>Open</button>
	</Row>
	<Row title="Visibility">
		<span>{app.visibility === 'listed' ? 'Listed' : 'Unlisted'}</span>
	</Row>
	{#if repository}
		<Row title="Source" description={repository}>
			<button type="button" class="button" onclick={() => openUrl(`https://github.com/${repository}`)}>Visit</button>
		</Row>
	{/if}
	{#each project.trusted_publishers as trusted (trusted.id)}
		<Row title="Publishes from" description="{trusted.repository}, {trusted.workflow}{trusted.environment ? `, ${trusted.environment}` : ''}" truncate />
	{/each}
	{#if app.licence}
		<Row title="Licence"><span>{app.licence}</span></Row>
	{/if}
	{#if app.privacy}
		<Row title="Privacy" description="{PRIVACY.telemetry[app.privacy.telemetry]}, {app.privacy.ads ? 'shows ads' : 'no ads'}, {PRIVACY.ai[app.privacy.ai]}" />
	{/if}
</Section>
