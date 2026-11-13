<script lang="ts">
	import { Segmented } from '@luft/ui';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import Loaded from '../../components/Loaded.svelte';
	import { projectTabs, type ProjectTab } from '../../pages';
	import { reads } from '../../state/reads';
	import Channels from './Channels.svelte';
	import Files from './Files.svelte';
	import Overview from './Overview.svelte';
	import People from './People.svelte';
	import Releases from './Releases.svelte';
	import Stats from './stats/Stats.svelte';

	let { id, tab }: { id: string; tab: ProjectTab } = $props();

	const project = $derived(reads.project(id));
	const releases = $derived(reads.releases(id));

	$effect(() => project.watch());
	$effect(() => releases.watch());
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-8 pt-2 pb-10">
		<div class="flex">
			<Segmented label="Project" value={tab} options={projectTabs(project.data)} onchange={(tab) => navigation.open({ page: 'project', id, tab })} />
		</div>
		<Loaded resource={project}>
			{#snippet children(project)}
				{#if tab === 'overview'}
					<Overview {project} {releases} />
				{:else if tab === 'releases'}
					<Releases {project} {releases} />
				{:else if tab === 'stats'}
					<Stats {project} />
				{:else if tab === 'channels'}
					<Channels {project} {releases} />
				{:else if tab === 'people'}
					<People {project} />
				{:else}
					<Files {project} />
				{/if}
			{/snippet}
		</Loaded>
	</div>
</div>
