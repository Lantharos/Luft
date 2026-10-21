<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { restart } from '../api';

	const SCREEN = { enroll: 'Enroll MOK', remove: 'Delete MOK', next: 'Continue', yes: 'Yes', reboot: 'Reboot' };

	let { code, removing = false, onclose }: { code: string; removing?: boolean; onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	const halves = $derived([code.slice(0, 4), code.slice(4)]);
	const enter = $derived(t('settings-security-key-enter'));
	const steps = $derived(
		[
			t('settings-security-key-step-choose', { option: removing ? SCREEN.remove : SCREEN.enroll, next: SCREEN.next }),
			t('settings-security-key-step-confirm', { option: SCREEN.yes }),
			t('settings-security-key-step-code', { key: enter }),
			t('settings-security-key-step-reboot', { option: SCREEN.reboot })
		].map((step) => emphasize(step, [...Object.values(SCREEN), enter]))
	);

	function emphasize(text: string, names: string[]) {
		return text.split(new RegExp(`(${names.join('|')})`)).map((part) => ({ part, bold: names.includes(part) }));
	}

	async function restartNow() {
		busy = true;
		error = '';
		try {
			await restart();
			onclose();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

<Dialog
	title={removing ? t('settings-security-key-steps-remove') : t('settings-security-key-steps-add')}
	description={removing ? t('settings-security-key-steps-remove-description') : t('settings-security-key-steps-add-description')}
	onclose={() => !busy && onclose()}
>
	<ol class="flex flex-col gap-2.5">
		{#each steps as parts, index (index)}
			<li class="step">
				<span class="number">{index + 1}</span>
				<span>{#each parts as piece, position (position)}{#if piece.bold}<b>{piece.part}</b>{:else}{piece.part}{/if}{/each}</span>
			</li>
		{/each}
	</ol>
	<div class="code" aria-label={t('settings-security-key-code', { code })}>
		{#each halves as half, index (index)}
			<span>{half}</span>
		{/each}
	</div>
	<p class="text-[12.5px] leading-relaxed text-[var(--text-muted)]">
		{removing ? t('settings-security-key-steps-remove-missed') : t('settings-security-key-steps-add-missed')}
	</p>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('settings-security-later')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={restartNow}>{t('settings-security-restart-now')}</button>
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
