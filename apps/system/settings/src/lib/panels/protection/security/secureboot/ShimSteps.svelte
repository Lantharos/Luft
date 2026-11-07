<script lang="ts">
	import { t } from '@luft/i18n';
	import { shimSteps, wrongCodeNote, type Piece } from './shim';

	let { code = '', removing = false }: { code?: string; removing?: boolean } = $props();

	let steps = $derived(shimSteps(removing));
	let halves = $derived([code.slice(0, 4), code.slice(4)]);
</script>

{#snippet line(pieces: Piece[])}
	{#each pieces as piece, position (position)}{#if piece.bold}<b>{piece.part}</b>{:else}{piece.part}{/if}{/each}
{/snippet}

{#if code}
	<div class="flex flex-col items-center gap-1.5">
		<div class="code" aria-label={t('settings-security-key-code', { code })}>
			{#each halves as half, index (index)}
				<span>{half}</span>
			{/each}
		</div>
		<p class="text-[12.5px] text-[var(--text-muted)]">{t('settings-secure-boot-code-hint')}</p>
	</div>
{/if}

<ol class="flex flex-col gap-2.5">
	{#each steps as pieces, index (index)}
		<li class="step">
			<span class="number">{index + 1}</span>
			<span>{@render line(pieces)}</span>
		</li>
	{/each}
</ol>
<p class="step-note">{@render line(wrongCodeNote())}</p>

<style>
	.step {
		display: flex;
		gap: 12px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--text-soft);
	}

	.step b,
	.step-note b {
		font-weight: 600;
		color: var(--text);
	}

	.step-note {
		padding-left: 28px;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--text-muted);
	}

	.number {
		width: 16px;
		flex: none;
		text-align: right;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.code {
		display: flex;
		justify-content: center;
		gap: 0.6em;
		width: 100%;
		padding: 16px;
		border-radius: 16px;
		background: var(--surface);
		font-family: var(--font-mono);
		font-size: 26px;
		letter-spacing: 0.08em;
		color: var(--text);
	}
</style>
