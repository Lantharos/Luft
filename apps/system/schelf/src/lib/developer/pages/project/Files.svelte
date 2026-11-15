<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import CopyLine from '../../components/CopyLine.svelte';
	import DomainRows from '../../components/DomainRows.svelte';
	import { list, platformName } from '../../format';
	import { act } from '../../state/act';
	import { reads } from '../../state/reads';
	import type { Platform, Project } from '../../store';
	import ToolRows from '../publisher/ToolRows.svelte';

	let { project }: { project: Project } = $props();

	const app = $derived(project.app);
	const parts = $derived(Object.entries(app.parts));
	const systems = (platforms: Platform[]) => list([...new Set(platforms.map(platformName))]);

	async function check() {
		const checked = await act(commands.developerCheckProjectDomain({ id: app.id }), t('developer-domain-checked-again'));
		if (checked) reads.project(app.id).set(checked);
	}
</script>

{#if project.tools.length}
	<Section title={t('developer-page-tools')}>
		{#each project.tools as tool (tool.name)}
			<ToolRows {tool} />
		{/each}
	</Section>
{/if}

{#if parts.length}
	<Section title={t('developer-files-parts')}>
		{#each parts as [name, part] (name)}
			<Row title={name} description={t('developer-files-part', { files: list(part.files), systems: systems(part.platforms) })} truncate>
				{#if part.tool}<span>{t('developer-files-installs', { tool: part.tool })}</span>{/if}
			</Row>
		{/each}
	</Section>
{/if}

{#if app.platforms}
	<Section title={t('developer-files-systems')}>
		<Row title={systems(app.platforms)} />
	</Section>
{/if}

<Section title={t('developer-files-links')}>
	<Row title={t('developer-files-newest')}>
		{#snippet below()}<CopyLine text={project.links.latest} label={t('developer-copy-link')} />{/snippet}
	</Row>
	<Row title={t('developer-files-json')}>
		{#snippet below()}<CopyLine text={project.links.json} label={t('developer-copy-link')} />{/snippet}
	</Row>
	{#each project.links.feeds as feed (feed.url)}
		<Row title={feed.part ? t('developer-files-feed-part', { part: feed.part }) : t('developer-files-feed')}>
			{#snippet below()}<CopyLine text={feed.url} label={t('developer-copy-link')} />{/snippet}
		</Row>
	{/each}
</Section>

{#if app.domain}
	<Section title={t('developer-page-domain')}>
		<DomainRows domain={app.domain} oncheck={check} />
	</Section>
{/if}
