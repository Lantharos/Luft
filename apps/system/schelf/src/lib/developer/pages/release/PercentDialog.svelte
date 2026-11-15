<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, Slider } from '@luft/ui';
	import { percent as formatPercent } from '../../format';
	import type { ReleaseSummary } from '../../store';

	let { release, onclose, onset }: { release: ReleaseSummary; onclose: () => void; onset: (percent: number) => Promise<boolean | void> } = $props();

	let percent = $state(untrack(() => Math.max(release.rollout_percent, 50)));
	let busy = $state(false);

	async function set() {
		busy = true;
		if ((await onset(percent)) !== false) onclose();
		busy = false;
	}
</script>

<Dialog title={t('developer-rollout-dialog-title')} description={t('developer-rollout-dialog-description')} {onclose}>
	<div class="flex items-center gap-4">
		<div class="flex-1">
			<Slider label={t('developer-rollout-percentage')} value={percent} min={1} max={100} step={1} oninput={(value) => (percent = value)} onchange={(value) => (percent = value)} />
		</div>
		<span class="w-12 text-right text-[14px] tabular-nums">{formatPercent(percent)}</span>
	</div>
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('developer-cancel')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={set}>{t('developer-rollout-set-to', { percent: formatPercent(percent) })}</button>
	{/snippet}
</Dialog>
