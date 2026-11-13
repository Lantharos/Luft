<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleMinus from '@lucide/svelte/icons/circle-minus';
	import Clock from '@lucide/svelte/icons/clock';
	import type { Component } from 'svelte';
	import { bytes, Row, Section } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import { openUrl } from '#lib/bridge/index.js';
	import Loaded from '../../components/Loaded.svelte';
	import { CHECK_TITLES, day, PLATFORM_NAMES, RELEASE_STATUS, shipped, type Tone } from '../../format';
	import { approvals } from '../../state/approval.svelte';
	import { changed, reads } from '../../state/reads';
	import type { Release } from '../../store';
	import Checks from './Checks.svelte';
	import PromoteDialog from './PromoteDialog.svelte';
	import Rollout from './Rollout.svelte';

	const TONE_ICONS: Record<Tone, Component> = { done: CircleCheck, active: Clock, attention: CircleAlert, quiet: CircleMinus };

	let { id, release: releaseId }: { id: string; release: string } = $props();

	const release = $derived(reads.release(id, releaseId));
	const project = $derived(reads.project(id));
	let promoting = $state(false);

	$effect(() => release.watch());
	$effect(() => project.watch());

	const others = (release: Release) => (project.data?.channels ?? []).map((channel) => channel.name).filter((channel) => channel !== release.channel);
	const flagged = (release: Release) => release.checks.filter((check) => check.status !== 'passed');
	const reviews = (release: Release) => release.timeline.flatMap((step) => (step.kind === 'review' ? [step] : []));

	function insideLuft(release: Release) {
		void approvals.ask(`Run ${release.version} inside Luft`, [{ type: 'release.inside-luft', app: id, release: release.id }], () => changed(id));
	}
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-8 pt-2 pb-10">
		<Loaded resource={release}>
			{#snippet children(release)}
				{@const reasons = flagged(release)}
				<Section>
					<Row title={RELEASE_STATUS[release.status].label} description={release.next ?? undefined} icon={TONE_ICONS[RELEASE_STATUS[release.status].tone]} />
					{#if release.status === 'in-review' && reasons.length}
						<Row title="Why it went to review" description={reasons.map((check) => `${CHECK_TITLES[check.name]}: ${check.summary}`).join('. ')} />
					{/if}
					{#each reviews(release) as review (review.at)}
						<Row title={review.decision ? `Reviewed: ${review.decision.replace(/-/g, ' ')}` : 'Waiting for a reviewer'} description={review.reason ?? undefined} />
					{/each}
					<Row title="On {channelName(release.channel)}" description="Published {day(release.created_at)}{release.approved_by ? `, approved by ${release.approved_by}` : ''}">
						{#if shipped(release) && others(release).length}
							<button type="button" class="button" onclick={() => (promoting = true)}>Offer on another channel</button>
						{/if}
					</Row>
					<Row title={release.origin === 'oidc' ? 'Built on GitHub Actions' : 'Uploaded by hand'} description={release.commit ? `At ${release.commit.slice(0, 7)}` : undefined}>
						{#if release.run_url}
							{@const run = release.run_url}
							<button type="button" class="button" onclick={() => openUrl(run)}>See the build</button>
						{/if}
					</Row>
					{#if release.shell?.requestable}
						<Row title="Run inside Luft">
							<button type="button" class="button" onclick={() => insideLuft(release)}>Ask</button>
						</Row>
					{/if}
				</Section>

				{#if shipped(release)}
					<Section title="Rollout">
						<Rollout {id} {release} onchange={(next) => reads.release(id, releaseId).set(next)} />
					</Section>
				{/if}

				<Checks {release} />

				{#if release.notes}
					<Section title="Release notes">
						<p class="notes">{release.notes}</p>
					</Section>
				{/if}

				<Section title="Files">
					{#each release.artifacts as file (file.name)}
						<Row title={file.name} description="{file.part ? `${file.part} for ` : ''}{PLATFORM_NAMES[file.platform]} · {bytes(file.size)}" truncate />
					{/each}
				</Section>

				{#if promoting}
					<PromoteDialog {id} {release} channels={others(release)} onclose={() => (promoting = false)} />
				{/if}
			{/snippet}
		</Loaded>
	</div>
</div>

<style>
	.notes {
		white-space: pre-line;
		padding: 14px 16px;
		font-size: 14px;
		color: var(--text-soft);
	}
</style>
