<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import CopyLine from '../../components/CopyLine.svelte';
	import DomainRows from '../../components/DomainRows.svelte';
	import { PLATFORM_NAMES } from '../../format';
	import { act } from '../../state/act';
	import { reads } from '../../state/reads';
	import type { Platform, Project } from '../../store';
	import ToolRows from '../publisher/ToolRows.svelte';

	let { project }: { project: Project } = $props();

	const app = $derived(project.app);
	const parts = $derived(Object.entries(app.parts));
	const systems = (platforms: Platform[]) => [...new Set(platforms.map((platform) => PLATFORM_NAMES[platform]))].join(', ');

	async function check() {
		const checked = await act(commands.developerCheckProjectDomain({ id: app.id }), 'Checked the domain again');
		if (checked) reads.project(app.id).set(checked);
	}
</script>

{#if project.tools.length}
	<Section title="Command-line tools">
		{#each project.tools as tool (tool.name)}
			<ToolRows {tool} />
		{/each}
	</Section>
{/if}

{#if parts.length}
	<Section title="Parts">
		{#each parts as [name, part] (name)}
			<Row title={name} description="{part.files.join(', ')} · {systems(part.platforms)}" truncate>
				{#if part.tool}<span>Installs {part.tool}</span>{/if}
			</Row>
		{/each}
	</Section>
{/if}

{#if app.platforms}
	<Section title="Systems">
		<Row title={systems(app.platforms)} />
	</Section>
{/if}

<Section title="Download links">
	<Row title="Newest release">
		{#snippet below()}<CopyLine text={project.links.latest} label="Copy the link" />{/snippet}
	</Row>
	<Row title="As JSON">
		{#snippet below()}<CopyLine text={project.links.json} label="Copy the link" />{/snippet}
	</Row>
	{#each project.links.feeds as feed (feed.url)}
		<Row title="Update feed{feed.part ? ` for ${feed.part}` : ''}">
			{#snippet below()}<CopyLine text={feed.url} label="Copy the link" />{/snippet}
		</Row>
	{/each}
</Section>

{#if app.domain}
	<Section title="Download domain">
		<DomainRows domain={app.domain} oncheck={check} />
	</Section>
{/if}
