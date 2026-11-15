<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, ProgressBar, Row } from '@luft/ui';
	import { commands, type Change } from '#lib/bindings.js';
	import { percent as formatPercent, rolloutText } from '../../format';
	import { act } from '../../state/act';
	import { approvals } from '../../state/approval.svelte';
	import { changed, reads } from '../../state/reads';
	import type { Release, ReleaseSummary } from '../../store';
	import PercentDialog from './PercentDialog.svelte';

	let { id, release, onchange }: { id: string; release: ReleaseSummary; onchange?: (release: Release) => void } = $props();

	let setting = $state(false);
	let everyone = $state(false);
	let busy = $state(false);

	const live = $derived(release.status === 'live');
	const previous = $derived(
		reads
			.releases(id)
			.data?.find((other) => other.channel === release.channel && other.id !== release.id && other.status === 'live' && other.created_at < release.created_at) ?? null
	);

	async function change(change: Change, done: string) {
		busy = true;
		const next = await act(commands.developerRollout({ id, release: release.id, change }), done);
		busy = false;
		if (!next) return false;
		onchange?.(next);
		changed(id);
	}

	function rollBack() {
		void approvals.ask(t('developer-rollout-roll-back-to', { version: previous?.version ?? '' }), [{ type: 'release.rollback', app: id, release: release.id }], () => changed(id));
	}
</script>

<Row title={rolloutText(release)}>
	{#if !live}
		<button type="button" class="button" disabled={busy} onclick={() => change({ action: release.rollout_paused ? 'resume' : 'pause' }, release.rollout_paused ? t('developer-rollout-resumed') : t('developer-rollout-paused', { percent: formatPercent(release.rollout_percent) }))}>
			{t(release.rollout_paused ? 'developer-rollout-resume' : 'developer-rollout-pause')}
		</button>
		<button type="button" class="button" disabled={busy} onclick={() => (setting = true)}>{t('developer-rollout-set')}</button>
		<button type="button" class="button" disabled={busy} onclick={() => (everyone = true)}>{t('developer-rollout-everyone-button')}</button>
	{/if}
	{#snippet below()}
		<ProgressBar fraction={release.rollout_percent / 100} label={t('developer-rollout-progress')} class="h-1.5" />
	{/snippet}
</Row>
{#if previous}
	<Row title={t('developer-rollout-roll-back-to', { version: previous.version })} description={t('developer-rollout-stops', { version: release.version })}>
		<button type="button" class="button" onclick={rollBack}>{t('developer-rollout-roll-back')}</button>
	</Row>
{/if}

{#if setting}
	<PercentDialog {release} onclose={() => (setting = false)} onset={(percent) => change({ action: 'set', percent }, t('developer-rollout-reaches', { version: release.version, percent: formatPercent(percent) }))} />
{/if}

{#if everyone}
	<ConfirmDialog
		title={t('developer-rollout-everyone-title', { version: release.version })}
		description={t('developer-rollout-everyone-description')}
		action={t('developer-rollout-everyone-button')}
		run={() => change({ action: 'all' }, t('developer-rollout-out', { version: release.version }))}
		onclose={() => (everyone = false)}
	/>
{/if}
