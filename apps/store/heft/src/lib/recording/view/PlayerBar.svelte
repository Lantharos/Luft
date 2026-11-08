<script lang="ts">
	import NotebookText from '@lucide/svelte/icons/notebook-text';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { formatClock, IconButton, SeekBar } from '@luft/ui';
	import { player } from '../player.svelte';
	import { processing } from '../processing.svelte';
	import { stageText } from './stage';

	let { panel, onpanel }: { panel: boolean; onpanel: () => void } = $props();

	const RATES = [1, 1.25, 1.5, 2, 0.75];
	const SKIP = 10_000;

	let recording = $derived(player.recording!);
	let stage = $derived(processing.stage(recording));

	function nextRate() {
		player.setRate(RATES[(RATES.indexOf(player.rate) + 1) % RATES.length]);
	}
</script>

<div class="player" role="region" aria-label={t('player-label')}>
	<IconButton icon={RotateCcw} label={t('player-back')} onclick={() => player.skip(-SKIP)} />
	<IconButton icon={player.playing ? Pause : Play} label={player.playing ? t('player-pause') : t('player-play')} large onclick={() => player.toggle()} />
	<IconButton icon={RotateCw} label={t('player-forward')} onclick={() => player.skip(SKIP)} />
	<span class="w-[46px] text-right text-[12px] text-(--text-muted) tabular-nums">{formatClock(player.position / 1000)}</span>
	<div class="min-w-[120px] flex-1">
		<SeekBar time={player.position / 1000} duration={player.length / 1000} label={t('player-seek')} onseek={(seconds) => player.seek(seconds * 1000)} />
	</div>
	<span class="w-[46px] text-[12px] text-(--text-muted) tabular-nums">{formatClock(player.length / 1000)}</span>
	<button type="button" class="rate tabular-nums" aria-label={t('player-rate')} onclick={nextRate}>{player.rate}×</button>
	<IconButton icon={NotebookText} label={panel ? t('player-panel-hide') : t('player-panel-show', { stage: stageText(stage, recording) })} onclick={onpanel} />
	<IconButton icon={X} label={t('player-close')} onclick={() => player.close()} />
</div>

<style>
	.player {
		position: absolute;
		left: 50%;
		bottom: 16px;
		z-index: 5;
		display: flex;
		width: min(720px, calc(100% - 32px));
		align-items: center;
		gap: 4px;
		transform: translateX(-50%);
		border-radius: 999px;
		padding: 4px 8px;
		background: var(--popover);
		box-shadow:
			0 0 0 1px var(--hairline),
			0 10px 30px var(--shadow-faint);
	}

	.rate {
		min-width: 44px;
		height: 32px;
		border-radius: 999px;
		color: var(--text-soft);
		font-size: 12.5px;
		font-weight: 600;
	}

	.rate:hover {
		background: var(--surface-hover);
	}
</style>
