<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleMinus from '@lucide/svelte/icons/circle-minus';
	import Clock from '@lucide/svelte/icons/clock';
	import type { Component } from 'svelte';
	import { t } from '@luft/i18n';
	import { bytes, Row, Section } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import { openUrl } from '#lib/bridge/index.js';
	import Loaded from '../../components/Loaded.svelte';
	import { checkTitle, day, platformName, shipped, statusLabel, statusTone, type Tone } from '../../format';
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
		void approvals.ask(t('developer-release-inside-luft-approval', { version: release.version }), [{ type: 'release.inside-luft', app: id, release: release.id }], () => changed(id));
	}
</script>

<div class="h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-8 pt-2 pb-10">
		<Loaded resource={release}>
			{#snippet children(release)}
				{@const reasons = flagged(release)}
				<Section>
					<Row title={statusLabel(release.status)} description={release.next ?? undefined} icon={TONE_ICONS[statusTone(release.status)]} />
					{#if release.status === 'in-review' && reasons.length}
						<Row
							title={t('developer-release-why-review')}
							description={reasons.map((check) => t('developer-release-reason', { check: checkTitle(check.name), summary: check.summary })).join('. ')}
						/>
					{/if}
					{#each reviews(release) as review (review.at)}
						<Row
							title={review.decision ? t('developer-release-reviewed', { decision: review.decision.replace(/-/g, ' ') }) : t('developer-release-waiting')}
							description={review.reason ?? undefined}
						/>
					{/each}
					<Row
						title={t('developer-release-on', { channel: channelName(release.channel) })}
						description={release.approved_by
							? t('developer-release-published-approved', { date: day(release.created_at), by: release.approved_by })
							: t('developer-overview-published', { date: day(release.created_at) })}
					>
						{#if shipped(release) && others(release).length}
							<button type="button" class="button" onclick={() => (promoting = true)}>{t('developer-release-offer-other')}</button>
						{/if}
					</Row>
					<Row
						title={t(release.origin === 'oidc' ? 'developer-release-built' : 'developer-release-by-hand')}
						description={release.commit ? t('developer-release-commit', { commit: release.commit.slice(0, 7) }) : undefined}
					>
						{#if release.run_url}
							{@const run = release.run_url}
							<button type="button" class="button" onclick={() => openUrl(run)}>{t('developer-release-see-build')}</button>
						{/if}
					</Row>
					{#if release.shell?.requestable}
						<Row title={t('developer-release-inside-luft')}>
							<button type="button" class="button" onclick={() => insideLuft(release)}>{t('developer-release-ask')}</button>
						</Row>
					{/if}
				</Section>

				{#if shipped(release)}
					<Section title={t('developer-release-rollout')}>
						<Rollout {id} {release} onchange={(next) => reads.release(id, releaseId).set(next)} />
					</Section>
				{/if}

				<Checks {release} />

				{#if release.notes}
					<Section title={t('developer-release-notes')}>
						<p class="notes">{release.notes}</p>
					</Section>
				{/if}

				<Section title={t('developer-release-files')}>
					{#each release.artifacts as file (file.name)}
						<Row
							title={file.name}
							description={file.part
								? t('developer-release-file-part', { part: file.part, platform: platformName(file.platform), size: bytes(file.size) })
								: t('developer-release-file', { platform: platformName(file.platform), size: bytes(file.size) })}
							truncate
						/>
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
