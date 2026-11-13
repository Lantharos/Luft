<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Spinner, TextField } from '@luft/ui';
	import { checkRecoveryKey } from '../../api';

	const RECOVERY_KEY_WORDS = 12;

	let { stored, onclose, onreplace }: { stored: boolean; onclose: () => void; onreplace: () => void } = $props();

	let key = $state('');
	let checking = $state(false);
	let works = $state<boolean | null>(null);
	let error = $state('');

	let ready = $derived(stored || key.trim() !== '');
	let older = $derived(key.trim() !== '' && key.trim().split(/\s+/).length !== RECOVERY_KEY_WORDS);

	async function check() {
		checking = true;
		error = '';
		works = null;
		try {
			const outcome = await checkRecoveryKey(key.trim());
			works = outcome.done ?? false;
		} catch (reason) {
			error = errorText(reason);
		}
		checking = false;
	}
</script>

<Dialog title={t('settings-recovery-check-title')} description={t(stored ? 'settings-recovery-check-description-stored' : 'settings-recovery-check-description')} onclose={() => !checking && onclose()}>
	<TextField
		label={t('settings-recovery-check-field')}
		placeholder={t('settings-recovery-check-field')}
		bind:value={key}
		disabled={checking}
		onkeydown={(event) => event.key === 'Enter' && ready && void check()}
	/>
	{#if works && older}
		<p class="text-[13px] leading-relaxed text-[var(--success)]">{t('settings-recovery-check-works-older')}</p>
	{:else if works}
		<p class="text-[13px] leading-relaxed text-[var(--success)]">{t('settings-recovery-check-works')}</p>
	{:else if works === false}
		<p class="text-[13px] leading-relaxed text-[var(--danger)]">{t('settings-recovery-check-fails')}</p>
	{:else if error}
		<p class="text-[13px] leading-relaxed text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if works === false || (works && older)}
			<button type="button" class="button mr-auto" onclick={onreplace}>{t('settings-recovery-replace-key')}</button>
		{/if}
		<button type="button" class="button" disabled={checking} onclick={onclose}>{t(works ? 'settings-protection-close' : 'settings-protection-cancel')}</button>
		<button type="button" class="button primary" disabled={checking || !ready} onclick={check}>{#if checking}<Spinner />{/if}{t('settings-recovery-check')}</button>
	{/snippet}
</Dialog>
