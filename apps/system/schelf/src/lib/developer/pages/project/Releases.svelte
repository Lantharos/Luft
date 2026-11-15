<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import Loaded from '../../components/Loaded.svelte';
	import Status from '../../components/Status.svelte';
	import type { Resource } from '../../state/resource.svelte';
	import type { Project, Releases } from '../../store';
	import { day } from '../../format';

	let { project, releases }: { project: Project; releases: Resource<Releases> } = $props();

	const channels = $derived(project.channels.map((channel) => channel.name));
	let shown = $state('');
	const filter = $derived(channels.includes(shown) ? shown : '');
	const options = $derived([{ value: '', label: t('developer-releases-every-channel') }, ...channels.map((channel) => ({ value: channel, label: channelName(channel) }))]);
</script>

<Loaded resource={releases}>
	{#snippet children(list)}
		{@const visible = filter ? list.filter((release) => release.channel === filter) : list}
		{#if channels.length > 1}
			<div class="-mt-3 -mb-3 flex justify-end">
				<Select label={t('developer-releases-channel')} {options} value={filter} onchange={(value) => (shown = value)} />
			</div>
		{/if}
		{#if visible.length}
			<Section>
				{#each visible as release (release.id)}
					<Row
						title={release.version}
						description={t('developer-releases-facts', { channel: channelName(release.channel), date: day(release.created_at), promoted: release.promoted_from ? 'yes' : 'no' })}
						onclick={() => navigation.push({ page: 'release', id: project.app.id, release: release.id, version: release.version })}
					>
						<Status status={release.status} />
					</Row>
				{/each}
			</Section>
		{:else}
			<p class="px-2 pt-10 text-center text-[14px] text-[var(--text-muted)]">{t('developer-releases-empty')}</p>
		{/if}
	{/snippet}
</Loaded>
