<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { restart } from '../api';
	import ShimSteps from '../secureboot/ShimSteps.svelte';

	let { code, onclose }: { code: string; onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

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

<Dialog title={t('settings-security-key-steps-remove')} description={t('settings-security-key-steps-remove-description')} onclose={() => !busy && onclose()}>
	<ShimSteps {code} removing />
	<p class="text-[12.5px] leading-relaxed text-[var(--text-muted)]">{t('settings-security-key-steps-remove-missed')}</p>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('settings-security-later')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={restartNow}>{t('settings-security-restart-now')}</button>
	{/snippet}
</Dialog>
