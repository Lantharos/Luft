<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Spinner, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';

	let { onclose }: { onclose: () => void } = $props();

	let address = $state('');
	let field = $state<TextField>();
	let adding = $state(false);
	let failed = $state(false);

	$effect(() => field?.focus());

	async function add() {
		if (!address.trim()) return;
		adding = true;
		failed = false;
		try {
			await commands.scannerAdd({ address: address.trim() }, { timeoutMs: 60_000 });
			onclose();
		} catch {
			failed = true;
		} finally {
			adding = false;
		}
	}
</script>

<Dialog title={t('add-title')} description={t('add-description')} onclose={() => !adding && onclose()}>
	<TextField
		bind:this={field}
		bind:value={address}
		label={t('add-address')}
		placeholder="192.168.1.20"
		inputmode="url"
		disabled={adding}
		error={failed ? t('add-failed', { address: address.trim() }) : ''}
		invalid={failed}
		live
		onkeydown={(event) => event.key === 'Enter' && void add()}
	/>
	{#snippet actions()}
		{#if adding}
			<span class="mr-auto flex items-center gap-2 text-[13px] text-[var(--text-soft)]"><Spinner size={14} />{t('add-looking')}</span>
		{/if}
		<button type="button" class="button" disabled={adding} onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" disabled={adding || !address.trim()} onclick={() => void add()}>{t('add-confirm')}</button>
	{/snippet}
</Dialog>
