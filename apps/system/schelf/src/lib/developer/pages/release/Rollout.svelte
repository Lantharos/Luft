<script lang="ts">
	import { ConfirmDialog, ProgressBar, Row } from '@luft/ui';
	import { commands, type Change } from '#lib/bindings.js';
	import { rolloutText } from '../../format';
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
		void approvals.ask(`Roll back to ${previous?.version}`, [{ type: 'release.rollback', app: id, release: release.id }], () => changed(id));
	}
</script>

<Row title={rolloutText(release)}>
	{#if !live}
		<button type="button" class="button" disabled={busy} onclick={() => change({ action: release.rollout_paused ? 'resume' : 'pause' }, release.rollout_paused ? 'Rollout resumed' : `Paused at ${release.rollout_percent}%`)}>
			{release.rollout_paused ? 'Resume' : 'Pause'}
		</button>
		<button type="button" class="button" disabled={busy} onclick={() => (setting = true)}>Set percentage</button>
		<button type="button" class="button" disabled={busy} onclick={() => (everyone = true)}>Release to everyone</button>
	{/if}
	{#snippet below()}
		<ProgressBar fraction={release.rollout_percent / 100} label="Rollout" class="h-1.5" />
	{/snippet}
</Row>
{#if previous}
	<Row title="Roll back to {previous.version}" description="Stops {release.version} for everyone">
		<button type="button" class="button" onclick={rollBack}>Roll back</button>
	</Row>
{/if}

{#if setting}
	<PercentDialog {release} onclose={() => (setting = false)} onset={(percent) => change({ action: 'set', percent }, `${release.version} reaches ${percent}% of people`)} />
{/if}

{#if everyone}
	<ConfirmDialog
		title="Release {release.version} to everyone?"
		description="Everyone gets it with their next update check."
		action="Release to everyone"
		run={() => change({ action: 'all' }, `${release.version} is out for everyone`)}
		onclose={() => (everyone = false)}
	/>
{/if}
