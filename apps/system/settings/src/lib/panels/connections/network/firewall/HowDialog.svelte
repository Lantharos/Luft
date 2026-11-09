<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';

	let { onclose }: { onclose: () => void } = $props();

	let parts = $derived([
		[t('settings-network-firewall-how-networks'), t('settings-network-firewall-how-networks.description')],
		[t('settings-network-firewall-how-apps'), t('settings-network-firewall-how-apps.description')],
		[t('settings-network-firewall-how-post'), t('settings-network-firewall-how-post.description')],
		[t('settings-network-firewall-how-extensions'), t('settings-network-firewall-how-extensions.description')],
		[t('settings-network-firewall-how-services'), t('settings-network-firewall-how-services.description')]
	]);
</script>

<Dialog title={t('settings-network-firewall-how')} {onclose} wide>
	<div class="flex flex-col gap-4">
		{#each parts as [title, text] (title)}
			<section class="flex flex-col gap-1">
				<h3 class="text-[14px] font-medium text-[var(--text)]">{title}</h3>
				<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">{text}</p>
			</section>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('settings-network-firewall-how-done')}</button>
	{/snippet}
</Dialog>
