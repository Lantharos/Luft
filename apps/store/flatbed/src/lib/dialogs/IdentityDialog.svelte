<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Spinner } from '@luft/ui';
	import { commands, type Scanner } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let { scanner }: { scanner: Scanner } = $props();

	let trusting = $state(false);

	function leave() {
		if (!trusting) flatbed.leaveChanged(scanner.id);
	}

	async function trust() {
		trusting = true;
		try {
			await commands.scannerTrust({ id: scanner.id }, { timeoutMs: 60_000 });
		} catch (error) {
			flatbed.toasts.show(errorText(error), { failed: true });
			flatbed.leaveChanged(scanner.id);
		} finally {
			trusting = false;
		}
	}
</script>

<Dialog title={t('identity-title')} description={t('identity-description', { name: scanner.name })} onclose={leave}>
	{#snippet actions()}
		<button type="button" class="button" data-autofocus disabled={trusting} onclick={leave}>{t('identity-leave')}</button>
		<button type="button" class="button" disabled={trusting} onclick={() => void trust()}>{#if trusting}<Spinner size={14} />{/if}{t('identity-trust')}</button>
	{/snippet}
</Dialog>
