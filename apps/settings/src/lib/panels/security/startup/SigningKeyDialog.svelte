<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { problem, restart } from '../api';

	let { code, onclose }: { code: string; onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	const halves = $derived([code.slice(0, 4), code.slice(4)]);

	async function restartNow() {
		busy = true;
		error = '';
		try {
			await restart();
			onclose();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

<Dialog
	title="Add the key when you restart"
	description="After you restart, a blue screen asks about a new key. It only waits 10 seconds, so press any key as soon as it appears."
	onclose={() => !busy && onclose()}
>
	<ol class="flex flex-col gap-2.5">
		<li class="step"><span class="number">1</span><span>Choose <b>Enroll MOK</b>, then <b>Continue</b>.</span></li>
		<li class="step"><span class="number">2</span><span>Choose <b>Yes</b>.</span></li>
		<li class="step"><span class="number">3</span><span>Type the code below and press <b>Enter</b>.</span></li>
		<li class="step"><span class="number">4</span><span>Choose <b>Reboot</b>.</span></li>
	</ol>
	<div class="code" aria-label="Code {code}">
		{#each halves as half, index (index)}
			<span>{half}</span>
		{/each}
	</div>
	<p class="text-[12.5px] leading-relaxed text-[var(--text-muted)]">If you miss it, your computer starts as usual and the steps show again at the next restart, with a new code.</p>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>Later</button>
		<button type="button" class="button primary" disabled={busy} onclick={restartNow}>Restart now</button>
	{/snippet}
</Dialog>

<style>
	.step {
		display: flex;
		gap: 12px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--text-soft);
	}

	.step b {
		font-weight: 600;
		color: var(--text);
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
		padding: 16px;
		border-radius: 16px;
		background: var(--surface);
		font-family: var(--font-mono);
		font-size: 26px;
		letter-spacing: 0.08em;
		color: var(--text);
	}
</style>
