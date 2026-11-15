<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, TextField } from '@luft/ui';

	const DOMAIN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.){2,}[a-z]{2,63}$/;

	let { onclose, onchoose }: { onclose: () => void; onchoose: (domain: string) => void } = $props();

	let name = $state('');
	let field = $state<ReturnType<typeof TextField>>();
	const domain = $derived(name.trim().toLowerCase());
	const valid = $derived(DOMAIN.test(domain));

	$effect(() => {
		const frame = requestAnimationFrame(() => field?.focus());
		return () => cancelAnimationFrame(frame);
	});
</script>

<Dialog title={t('developer-domain-dialog-title')} description={t('developer-domain-dialog-description')} {onclose}>
	<TextField bind:this={field} bind:value={name} label={t('developer-domain-field')} placeholder={t('developer-domain-placeholder')} onkeydown={(event) => event.key === 'Enter' && valid && onchoose(domain)} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('developer-cancel')}</button>
		<button type="button" class="button primary" disabled={!valid} onclick={() => onchoose(domain)}>{t('developer-domain-continue')}</button>
	{/snippet}
</Dialog>
