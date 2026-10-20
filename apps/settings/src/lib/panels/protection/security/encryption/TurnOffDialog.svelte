<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { problem, turnOffEncryption } from '../api';
	import { withUnlock } from './unlock.svelte';

	let { onclose }: { onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	async function turnOff() {
		busy = true;
		error = '';
		try {
			if (await withUnlock(turnOffEncryption)) onclose();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

<Dialog
	title={t('settings-encryption-turn-off-title')}
	description={t('settings-encryption-turn-off-description')}
	onclose={() => !busy && onclose()}
>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('settings-encryption-keep')}</button>
		<button type="button" class="button danger" disabled={busy} onclick={turnOff}>{busy ? t('settings-encryption-turning-off') : t('settings-encryption-turn-off')}</button>
	{/snippet}
</Dialog>
