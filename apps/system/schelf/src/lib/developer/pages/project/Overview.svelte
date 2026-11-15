<script lang="ts">
	import { t } from '@luft/i18n';
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

	function show(release: ReleaseSummary) {
		navigation.push({ page: 'release', id: app.id, release: release.id, version: release.version });
	}
</script>

{#if latest}
	<Section title={t('developer-overview-latest')}>
		<Row title={t('developer-overview-latest-on', { version: latest.version, channel: channelName(latest.channel) })} description={t('developer-overview-published', { date: day(latest.created_at) })} onclick={() => show(latest)}>
			<Status status={latest.status} />
		</Row>
	</Section>
{/if}

<Section title={t('developer-overview-each-channel')}>
	{#each project.channels as channel (channel.name)}
		{@const live = liveOn(list, channel.name)}
		{#if live}
			<Row title={channelName(channel.name)} description={t('developer-overview-channel-live', { version: live.version, rollout: rolloutText(live) })} onclick={() => show(live)}>
				{#if channel.invite_only}<span>{t('developer-invite-only')}</span>{/if}
			</Row>
		{:else}
			<Row title={channelName(channel.name)} description={channel.ended_into ? t('developer-overview-channel-ended', { channel: channelName(channel.ended_into) }) : t('developer-overview-channel-empty')} />
		{/if}
	{/each}
</Section>

<Section title={t('developer-overview-project')}>
	<Row title={t('developer-overview-installs-week')}><span class="tabular-nums">{count(app.installs_7d)}</span></Row>
	<Row title={t('developer-overview-page')} description={project.links.page} truncate>
		<button type="button" class="button" onclick={() => openUrl(project.links.page)}>{t('developer-overview-open')}</button>
	</Row>
	<Row title={t('developer-overview-visibility')}>
		<span>{t(app.visibility === 'listed' ? 'developer-overview-listed' : 'developer-overview-unlisted')}</span>
	</Row>
	{#if repository}
		<Row title={t('developer-overview-source')} description={repository}>
			<button type="button" class="button" onclick={() => openUrl(`https://github.com/${repository}`)}>{t('developer-overview-visit')}</button>
		</Row>
	{/if}
	{#each project.trusted_publishers as trusted (trusted.id)}
		<Row
			title={t('developer-overview-publishes-from')}
			description={trusted.environment
				? t('developer-overview-workflow-environment', { repository: trusted.repository, workflow: trusted.workflow, environment: trusted.environment })
				: t('developer-overview-workflow', { repository: trusted.repository, workflow: trusted.workflow })}
			truncate
		/>
	{/each}
	{#if app.licence}
		<Row title={t('developer-overview-licence')}><span>{app.licence}</span></Row>
	{/if}
	{#if app.privacy}
		<Row title={t('developer-overview-privacy')} description={t('developer-overview-privacy-facts', { telemetry: app.privacy.telemetry, ads: app.privacy.ads ? 'yes' : 'no', ai: app.privacy.ai })} />
	{/if}
</Section>
